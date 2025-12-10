import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { User, Post, ChatSession } from './types';
import { Home } from './pages/Home';
import { Radio } from './pages/Radio';
import { Messages } from './pages/Messages';
import { ChatDetail } from './pages/ChatDetail';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Navigation } from './components/Navigation';
import { CreatePostModal } from './components/CreatePostModal';
import { createPost, getPostsForUser } from './services/postService';
import { jwtDecode } from 'jwt-decode';

// 后端帖子数据接口
interface BackendPost {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: null | string;
  user_id: number;
  user: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    email: string;
  };
  type: string;
  text_content: string;
  media_urls: string[] | null;
  status: string;
}

// 后端帖子响应接口
interface PostsResponse {
  data: BackendPost[];
  page: number;
  total: number;
}

// 转换函数：后端数据格式 -> 前端数据格式
const transformBackendPostToFrontend = (backendPost: BackendPost): Post => {
  return {
    id: backendPost.ID.toString(),
    userId: backendPost.user_id.toString(),
    userNickname: backendPost.user.email.split('@')[0],
    userAvatar: `https://picsum.photos/seed/${backendPost.user.ID}/100`,
    category: 'text', // 默认值，后端暂无此字段
    content: backendPost.text_content || '',
    images: backendPost.media_urls || [],
    videoUrl: undefined,
    audioUrl: undefined,
    isLivePhoto: false,
    timestamp: new Date(backendPost.CreatedAt).getTime(),
    likes: 0, // 默认值，后端暂无此字段
    isLiked: false, // 默认值，后端暂无此字段
    comments: [], // 默认值，后端暂无此字段
    viewCount: 0, // 默认值，后端暂无此字段
    tags: [], // 默认值，后端暂无此字段
  };
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const handleLogin = (token: string) => {
    try {
      const decodedToken: { user_id: number; email: string; exp: number } = jwtDecode(token);

      if (decodedToken.exp * 1000 > Date.now()) {
        setUser({
          id: decodedToken.user_id.toString(),
          nickname: decodedToken.email.split('@')[0],
          avatarUrl: `https://picsum.photos/seed/${decodedToken.user_id}/100`, // 修复：移除空格
          isAnonymous: false,
        });
        localStorage.setItem('token', token);
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

  const fetchPosts = useCallback(async (pageNum: number) => {
    if (!user) return;
    setIsLoadingPosts(true);
    try {
      const response: PostsResponse = await getPostsForUser(user.id, pageNum);
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
  }, [user, posts.length]);

  useEffect(() => {
    if (user) {
      fetchPosts(1);
      setPage(1); // 重置页码
    }
  }, [user, fetchPosts]);

  const handleLoadMore = () => {
    if (!isLoadingPosts && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const handleLike = (id: string) => {
    console.log("Liking post", id);
    // TODO: API call to like a post
  };

  const handleCreatePost = async (data: Partial<Post>) => {
    if (!user) return;
    try {
      const payload = {
        user_id: parseInt(user.id, 10),
        type: data.images && data.images.length > 0 ? 'text_image' : 'text',
        text_content: data.content || '',
        media_urls: data.images || [],
        tags: data.tags || [],
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
        <div className="font-sans text-gray-900 mx-auto bg-gray-50 h-screen relative shadow-2xl overflow-hidden max-w-md w-full flex flex-col">
          <div className="flex-1 overflow-y-auto no-scrollbar" id="scrollable-container">
            <Routes>
              <Route path="/" element={
                <div className="pt-safe">
                  <Home 
                    posts={posts} 
                    onLike={handleLike} 
                    onComment={() => {}} 
                    loading={isLoadingPosts && page === 1}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    isLoadingMore={isLoadingPosts}
                  />
                </div>
              } />
              <Route path="/radio" element={<div className="pt-safe"><Radio /></div>} />
              <Route path="/messages" element={<Messages sessions={sessions} />} />
              <Route path="/chat/:id" element={<ChatDetail sessions={sessions} onSendMessage={handleSendMessage} currentUserId={user.id} />} />
              <Route path="/profile" element={<Profile user={user} posts={posts} onLogout={handleLogout} />} />
              <Route path="/create" element={<>
                  <div className="pt-safe">
                     <Home 
                       posts={posts} 
                       onLike={handleLike} 
                       onComment={() => {}} 
                       loading={false} 
                       onLoadMore={() => {}} 
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