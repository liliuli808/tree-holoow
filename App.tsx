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

// --- Global Constants & Mock Data ---

const INITIAL_USER: User | null = null; // Start logged out

const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u2',
    userNickname: '匿名用户_9A2',
    userAvatar: 'https://picsum.photos/seed/u2/100',
    category: Category.LOVE,
    content: '今天在地铁上遇到了一个很可爱的男生，他一直看书，阳光洒在他侧脸上的样子真的好心动...不敢去要微信，只能在这里碎碎念。',
    images: ['https://picsum.photos/seed/p1/500/500'],
    timestamp: Date.now() - 3600000,
    likes: 24,
    isLiked: false,
    comments: [],
    viewCount: 120,
    isLivePhoto: true
  },
  {
    id: 'p2',
    userId: 'u3',
    userNickname: '夜猫子',
    userAvatar: 'https://picsum.photos/seed/u3/100',
    category: Category.GAME,
    content: '谁懂啊！昨天排位连跪十把，心态崩了。有没有玩王者的，求带飞！ID私我，不想努力了。',
    images: [],
    timestamp: Date.now() - 7200000,
    likes: 5,
    isLiked: false,
    comments: [],
    viewCount: 45
  },
  {
    id: 'p3',
    userId: 'u4',
    userNickname: '音乐疯子',
    userAvatar: 'https://picsum.photos/seed/u4/100',
    category: Category.MUSIC,
    content: '刚刚写了一段旋律，大家听听看怎么样？有点忧伤的感觉。',
    images: [],
    audioUrl: 'mock_audio.mp3',
    timestamp: Date.now() - 10000000,
    likes: 89,
    isLiked: true,
    comments: [],
    viewCount: 300
  }
];

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
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_CHATS);

  // Load user from local storage (simulation)
  useEffect(() => {
    const savedUser = localStorage.getItem('treehollow_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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
      id: `p_${Date.now()}`,
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
    
    // Add user message
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

    // If chatting with AI, generate response
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
      }, 1500); // Small delay for realism
    }
  };

  return (
    <HashRouter>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        // Enforce Mobile Width on Desktop, but full height
        <div className="font-sans text-gray-900 mx-auto bg-gray-50 h-screen relative shadow-2xl overflow-hidden max-w-md w-full flex flex-col">
          {/* Main Layout Container */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <Routes>
              <Route path="/" element={<div className="pt-safe"><Home posts={posts} onLike={handleLike} onComment={() => {}} loading={false} /></div>} />
              <Route path="/radio" element={<div className="pt-safe"><Radio /></div>} />
              <Route path="/messages" element={<Messages sessions={sessions} />} />
              <Route path="/chat/:id" element={<ChatDetail sessions={sessions} onSendMessage={handleSendMessage} currentUserId={user.id} />} />
              <Route path="/profile" element={<Profile user={user} posts={posts} onLogout={handleLogout} />} />
              {/* Route for Create Modal simulation */}
              <Route path="/create" element={<>
                  <div className="pt-safe"><Home posts={posts} onLike={handleLike} onComment={() => {}} loading={false} /></div>
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

// Helper to handle modal navigation
const CreatePostWrapper: React.FC<{ onPost: (data: Partial<Post>) => void }> = ({ onPost }) => {
  const navigate = useNavigate();
  return <CreatePostModal isOpen={true} onClose={() => navigate(-1)} onPost={onPost} />;
}