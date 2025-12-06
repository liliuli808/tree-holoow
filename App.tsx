import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { User, Post, Category, ChatSession, ChatMessage } from './types';
import { Home } from './pages/Home';
import { Radio } from './pages/Radio';
import { Messages } from './pages/Messages';
import { ChatDetail } from './pages/ChatDetail';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Navigation } from './components/Navigation';
import { CreatePostModal } from './components/CreatePostModal';
import { generateAIResponse } from './services/geminiService';

// --- Global Constants & Mock Data Generation ---

const INITIAL_USER: User | null = null; 

// Generate a large set of mock posts to simulate a database
const generateMockPosts = (count: number): Post[] => {
  return Array.from({ length: count }).map((_, index) => ({
    id: `p_${index}`,
    userId: `u_${index % 5}`,
    userNickname: `用户_${Math.floor(Math.random() * 1000)}`,
    userAvatar: `https://picsum.photos/seed/u_${index % 5}/100`,
    category: Object.values(Category)[Math.floor(Math.random() * (Object.values(Category).length - 1)) + 1], // Random category skipping 'ALL'
    content: index % 2 === 0 
      ? `这是第 ${index + 1} 条模拟的树洞内容。在这个喧嚣的世界里，寻找一片属于自己的宁静。`
      : `刚刚发生了一件很有趣的事情... #${index}号树洞`,
    images: Math.random() > 0.7 ? [`https://picsum.photos/seed/p_${index}/500/500`] : [],
    timestamp: Date.now() - (index * 3600000), // Stagger times
    likes: Math.floor(Math.random() * 100),
    isLiked: false,
    comments: [],
    viewCount: Math.floor(Math.random() * 1000),
    isLivePhoto: Math.random() > 0.9
  }));
};

// Simulate a database of 50 posts
const ALL_MOCK_POSTS = generateMockPosts(50);
const PAGE_SIZE = 10;

const MOCK_CHATS: ChatSession[] = [
  {
    id: 'c1',
    partnerId: 'ai_elf',
    partnerName: '树洞精灵',
    partnerAvatar: 'https://picsum.photos/seed/elf/100',
    lastMessage: '欢迎来到树洞，有什么心事都可以告诉我哦~',
    lastMessageTime: Date.now(),
    unreadCount: 1,
    messages: [
      { id: 'm1', senderId: 'ai_elf', text: '欢迎来到树洞，有什么心事都可以告诉我哦~', type: 'text', timestamp: Date.now(), isRead: false }
    ]
  }
];

// --- Main App Logic ---

export default function App() {
  const [user, setUser] = useState<User | null>(INITIAL_USER);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_CHATS);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Load user from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('treehollow_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    // Initial Load
    fetchPosts(1);
  }, []);

  // Simulate API fetch with pagination
  const fetchPosts = async (pageNum: number) => {
    setIsLoadingPosts(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const start = (pageNum - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const newPosts = ALL_MOCK_POSTS.slice(start, end);

    if (pageNum === 1) {
      setPosts(newPosts);
    } else {
      setPosts(prev => [...prev, ...newPosts]);
    }

    // Check if we have loaded all posts
    if (end >= ALL_MOCK_POSTS.length) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
    
    setIsLoadingPosts(false);
  };

  const handleLoadMore = () => {
    if (!isLoadingPosts && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('treehollow_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('treehollow_user');
  };

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => 
      p.id === id 
        ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked } 
        : p
    ));
  };

  const handleCreatePost = (data: Partial<Post>) => {
    if (!user) return;
    const newPost: Post = {
      id: `p_new_${Date.now()}`,
      userId: user.id,
      userNickname: user.nickname,
      userAvatar: user.avatarUrl,
      category: data.category || Category.MOMENT,
      content: data.content || '',
      images: data.images || [],
      timestamp: Date.now(),
      likes: 0,
      isLiked: false,
      comments: [],
      viewCount: 0
    };
    setPosts([newPost, ...posts]);
  };

  const handleSendMessage = async (sessionId: string, text: string) => {
    if (!user) return;
    
    const userMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      senderId: user.id,
      text,
      type: 'text',
      timestamp: Date.now(),
      isRead: false
    };

    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, messages: [...s.messages, userMsg], lastMessage: text, lastMessageTime: Date.now() } 
        : s
    ));

    const currentSession = sessions.find(s => s.id === sessionId);
    if (currentSession?.partnerId === 'ai_elf') {
      const responseText = await generateAIResponse(text, "User is chatting with the app's mascot.");
      
      const aiMsg: ChatMessage = {
        id: `m_${Date.now() + 1}`,
        senderId: 'ai_elf',
        text: responseText,
        type: 'text',
        timestamp: Date.now() + 1000,
        isRead: false
      };

      setTimeout(() => {
        setSessions(prev => prev.map(s => 
          s.id === sessionId 
            ? { ...s, messages: [...s.messages, aiMsg], lastMessage: responseText, lastMessageTime: Date.now() } 
            : s
        ));
      }, 1500);
    }
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
