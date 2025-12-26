import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { User, Post, ChatSession, Category } from './types';
import { Home } from './pages/Home';
import { Radio } from './pages/Radio';
import { Messages } from './pages/Messages';
import { ChatDetail } from './pages/ChatDetail';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { MyProfile } from './pages/MyProfile';
import { ProfileBio } from './pages/ProfileBio';
import { PostDetail } from './pages/PostDetail';
import { Navigation } from './components/Navigation';
import { CreatePostModal } from './components/CreatePostModal';
import { createPost, getAllPosts } from './services/postService';
import { getAllTags, Tag } from './services/tagService';
import { getMediaUrl } from './services/api';
import { websocketService } from './services/websocketService';
import { jwtDecode } from 'jwt-decode';

// 后端帖子数据接口
interface BackendPost {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: null | string;
  user_id: number;
  tag: {
    ID: number;
    name: string
  }
  user: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    email: string;
    nickname?: string;
    avatar_url?: string;
  };
  type: string;
  text_content: string;
  media_urls: string[] | null;
  cover_url?: string;
  status: string;
  likes_count: number;
  is_liked: boolean;
}

// 后端帖子响应接口
interface PostsResponse {
  data: BackendPost[];
  page: number;
  total: number;
}

// 将后端 tag name 映射到前端 Category 枚举
const mapTagToCategory = (tagName: string): Category => {
  const tagMap: Record<string, Category> = {
    '恋爱': Category.LOVE,
    '游戏': Category.GAME,
    '音乐': Category.MUSIC,
    '电影': Category.MOVIE,
    '交友': Category.FRIENDS,
    '此刻': Category.MOMENT,
    '表白': Category.CONFESSION,
    '吐槽': Category.TRASH,
  };
  return tagMap[tagName] || Category.ALL;
};

// 转换函数：后端数据格式 -> 前端数据格式
const transformBackendPostToFrontend = (backendPost: BackendPost): Post => {
  const isVideo = backendPost.type === 'video';
  const isAudio = backendPost.type === 'audio';
  const mediaUrls = backendPost.media_urls || [];

  // 根据类型正确分配媒体 URL
  const images = (!isVideo && !isAudio) ? mediaUrls : [];
  const videoUrl = isVideo && mediaUrls.length > 0 ? mediaUrls[0] : undefined;
  const audioUrl = isAudio && mediaUrls.length > 0 ? mediaUrls[0] : undefined;

  const tagName = backendPost.tag ? backendPost.tag.name : '未分类';

  return {
    id: backendPost.ID.toString(),
    userId: backendPost.user_id.toString(),
    userNickname: backendPost.user.nickname || backendPost.user.email.split('@')[0],
    userAvatar: backendPost.user.avatar_url ? getMediaUrl(backendPost.user.avatar_url) : `https://picsum.photos/seed/${backendPost.user.ID}/100`,
    category: mapTagToCategory(tagName), // 使用映射函数
    content: backendPost.text_content || '',
    images,
    videoUrl,
    audioUrl,
    cover: backendPost.cover_url,
    isLivePhoto: false,
    timestamp: new Date(backendPost.CreatedAt).getTime(),
    likes: backendPost.likes_count || 0,
    isLiked: backendPost.is_liked || false,
    comments: [], // 默认值,后端暂无此字段
    viewCount: 0, // 默认值,后端暂无此字段
    tag: {
      id: backendPost.tag ? backendPost.tag.ID.toString() : '0',
      name: tagName
    },
    type: backendPost.type || 'text'
  };
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [activeTagId, setActiveTagId] = useState<number | undefined>(undefined);

  // Load tags on mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const fetchedTags = await getAllTags();
        setTags(fetchedTags);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };
    loadTags();
  }, []);

  const handleLogin = (token: string) => {
    try {
      const decodedToken: { user_id: number; email: string; exp: number } = jwtDecode(token);

      if (decodedToken.exp * 1000 > Date.now()) {
        setUser({
          id: decodedToken.user_id.toString(),
          nickname: decodedToken.email.split('@')[0],
          avatarUrl: `https://picsum.photos/seed/${decodedToken.user_id}/100`,
          isAnonymous: false,
        });
        localStorage.setItem('token', token);

        // Connect WebSocket for real-time chat
        websocketService.connect(token);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      handleLogin(token)
    }
  }, []);

  const fetchPosts = useCallback(async (pageNum: number, tagId?: number) => {
    setIsLoadingPosts(true);
    try {
      const response: PostsResponse = await getAllPosts(pageNum, tagId);
      const newPosts = (response.data || []).map(transformBackendPostToFrontend);

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      const totalLoaded = pageNum === 1 ? newPosts.length : posts.length + newPosts.length;
      setHasMore(totalLoaded < response.total);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts(pageNum === 1 ? [] : posts);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [posts.length]);

  // 当activeTagId变化时重新获取帖子
  useEffect(() => {
    fetchPosts(1, activeTagId);
    setPage(1);
  }, [activeTagId, fetchPosts]);

  const handleLoadMore = () => {
    if (!isLoadingPosts && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, activeTagId);
    }
  };

  const handleLogout = () => {
    websocketService.disconnect();
    setUser(null);
    localStorage.removeItem('token');
  };

  const handleProfileUpdate = (nickname: string, avatarUrl: string, backgroundUrl?: string) => {
    if (user) {
      setUser({
        ...user,
        nickname,
        avatarUrl,
        ...(backgroundUrl && { backgroundUrl })
      });
    }
  };

  const handleLike = async (id: string) => {
    try {
      const { toggleLike } = await import('./services/likeCommentService');
      const result = await toggleLike(id);

      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === id) {
          return {
            ...post,
            isLiked: result.liked,
            likes: result.count
          };
        }
        return post;
      }));
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleCreatePost = async (data: Partial<Post>) => {
    if (!user) return;
    try {
      // Get the tag ID - one-to-one relationship
      let tagId: number | undefined;
      if (data.tag) {
        const tagName = data.tag.name;
        const foundTag = tags.find(t => t.name === tagName);
        if (foundTag) {
          tagId = foundTag.ID;
        }
      }

      const payload = {
        user_id: parseInt(user.id, 10),
        text_content: data.content || '',
        images: data.images || [],
        video: data.video || undefined,
        audio: data.audio || undefined,
        cover: data.cover || undefined,
        tag_id: tagId,  // Single tag ID for one-to-one relationship
        status: 'published' as const,
      };
      const newPost: BackendPost = await createPost(payload);
      const frontendPost = transformBackendPostToFrontend(newPost);
      setPosts(prev => [frontendPost, ...prev]);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const handleSendMessage = async (sessionId: string, text: string) => {
    console.log("Sending message:", text);
    // TODO: 实现发送消息逻辑
  };

  return (
    <HashRouter>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="font-sans text-gray-800 mx-auto bg-white h-screen relative shadow-soft-lg overflow-hidden max-w-md w-full flex flex-col">
          <div className="flex-1 overflow-y-auto no-scrollbar" id="scrollable-container">
            <Routes>
              <Route path="/" element={
                <div className="pt-safe">
                  <Home
                    posts={posts}
                    onLike={handleLike}
                    onComment={() => { }}
                    loading={isLoadingPosts && page === 1}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    isLoadingMore={isLoadingPosts}
                    onTagChange={(tagId) => setActiveTagId(tagId)}
                    tags={tags}
                  />
                </div>
              } />
              <Route path="/radio" element={<div className="pt-safe"><Radio /></div>} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/chat/:id" element={<ChatDetail />} />
              <Route path="/post/:postId" element={<PostDetail posts={posts} />} />
              <Route path="/profile" element={<MyProfile />} />
              <Route path="/profile/edit" element={<Profile onProfileUpdate={handleProfileUpdate} />} />
              <Route path="/profile/edit/bio" element={<ProfileBio />} />
              <Route path="/create" element={<>
                <div className="pt-safe">
                  <Home
                    posts={posts}
                    onLike={handleLike}
                    onComment={() => { }}
                    loading={false}
                    onLoadMore={() => { }}
                    hasMore={false}
                    isLoadingMore={false}
                  />
                </div>
                <CreatePostWrapper onPost={handleCreatePost} />
              </>}
              />
            </Routes>
          </div>
          <Navigation />
        </div>
      )}
    </HashRouter>
  );
}

const CreatePostWrapper: React.FC<{ onPost: (data: Partial<Post>) => void }> = ({ onPost }) => {
  const navigate = useNavigate();
  return <CreatePostModal isOpen={true} onClose={() => navigate(-1)} onPost={onPost} />;
}