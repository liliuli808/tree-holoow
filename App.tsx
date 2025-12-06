import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, MessageSquare, User as UserIcon, PlusCircle, PenTool, Image as ImageIcon, Mic, Lock, Bell, ChevronLeft, Send, Search, Settings, MoreVertical, LogOut, Video, Radio as RadioIcon } from 'lucide-react';
import { User, Post, Category, ChatSession, ChatMessage } from './types';
import { Home } from './pages/Home';
import { Radio } from './pages/Radio';
import { checkContentSafety, generateAIResponse } from './services/geminiService';
import { Avatar } from './components/Components';

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

// --- Sub-Pages (Inline for single file requirement compliance within reason) ---

const Login: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin({
        id: `user_${Math.floor(Math.random() * 10000)}`,
        nickname: `匿名用户_${Math.random().toString(36).substring(7).toUpperCase()}`,
        avatarUrl: `https://picsum.photos/seed/${Date.now()}/100`,
        isAnonymous: true
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col justify-center max-w-md mx-auto pt-safe pb-safe">
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-brand-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-brand-200">
          <PenTool className="text-white w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎来到树洞</h1>
        <p className="text-gray-500">卸下面具，做真实的自己</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {step === 1 ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                placeholder="enter@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button 
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-brand-500 text-white py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-200/50"
            >
              下一步
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-center tracking-widest text-xl"
                placeholder="1 2 3 4"
                defaultValue="1234"
              />
              <p className="text-xs text-gray-400 mt-2 text-center">验证码已发送至 {email}</p>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 text-white py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-200/50 flex justify-center"
            >
              {loading ? '登录中...' : '开始探索'}
            </button>
          </>
        )}
      </form>
      
      <p className="mt-8 text-center text-xs text-gray-300">
        登录即代表同意《用户协议》与《隐私政策》<br/>
        您的身份信息将被严格加密保护
      </p>
    </div>
  );
};

const Messages: React.FC<{ sessions: ChatSession[] }> = ({ sessions }) => {
  return (
    <div className="pb-24 bg-white min-h-screen pt-safe">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <h1 className="text-lg font-bold">消息</h1>
        <div className="flex gap-4 text-gray-600">
          <Search size={20} />
          <Bell size={20} />
        </div>
      </div>
      
      <div className="divide-y divide-gray-50">
        {sessions.map(session => (
          <Link to={`/chat/${session.id}`} key={session.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
            <div className="relative">
              <Avatar url={session.partnerAvatar} size="lg" />
              {session.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center border-2 border-white">
                  {session.unreadCount}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-800 truncate">{session.partnerName}</h3>
                <span className="text-xs text-gray-400">
                  {new Date(session.lastMessageTime).getHours()}:{new Date(session.lastMessageTime).getMinutes().toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-gray-500 text-sm truncate">{session.lastMessage}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const ChatDetail: React.FC<{ sessions: ChatSession[], onSendMessage: (sid: string, text: string) => void, currentUserId: string }> = ({ sessions, onSendMessage, currentUserId }) => {
  // Use generic hook to get ID from URL in real app, here we fake logic
  const location = useLocation();
  const sessionId = location.pathname.split('/').pop();
  const session = sessions.find(s => s.id === sessionId);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  if (!session) return <div>Session not found</div>;

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(session.id, input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 pt-safe pb-safe">
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-20">
        <Link to="/messages" className="text-gray-600"><ChevronLeft /></Link>
        <Avatar url={session.partnerAvatar} size="sm" />
        <span className="font-bold text-gray-800">{session.partnerName}</span>
        <div className="ml-auto text-gray-400"><MoreVertical size={20}/></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-xs text-gray-300 py-2">
          树洞加密通话，阅后即焚已开启
        </div>
        {session.messages.map(msg => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                isMe 
                  ? 'bg-brand-500 text-white rounded-tr-sm' 
                  : 'bg-white text-gray-800 shadow-sm rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="bg-white p-3 border-t border-gray-100 flex items-center gap-3">
        <Mic className="text-gray-400" size={24} />
        <ImageIcon className="text-gray-400" size={24} />
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="发送消息..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={!input.trim()} className={`${input.trim() ? 'text-brand-500' : 'text-gray-300'}`}>
          <Send size={24} />
        </button>
      </div>
    </div>
  );
}

const Profile: React.FC<{ user: User, posts: Post[], onLogout: () => void }> = ({ user, posts, onLogout }) => {
  const myPosts = posts.filter(p => p.userId === user.id);

  return (
    <div className="pb-24 bg-gray-50 min-h-screen pt-safe">
      <div className="bg-white pb-6 pt-6 px-6 rounded-b-3xl shadow-sm mb-4 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar url={user.avatarUrl} size="lg" />
              <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.nickname}</h2>
              <p className="text-sm text-gray-500 font-mono">ID: {user.id}</p>
            </div>
          </div>
          <Link to="/settings" className="p-2 bg-gray-50 rounded-full text-gray-600">
            <Settings size={20} />
          </Link>
        </div>

        <div className="flex justify-around text-center">
          <div>
            <div className="text-xl font-bold text-gray-900">{myPosts.length}</div>
            <div className="text-xs text-gray-500">树洞</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">128</div>
            <div className="text-xs text-gray-500">关注</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">456</div>
            <div className="text-xs text-gray-500">粉丝</div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-3">
        <h3 className="font-bold text-gray-800 ml-1">我的发布</h3>
        {myPosts.length > 0 ? (
          myPosts.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
               <span className="truncate flex-1 pr-4 text-gray-700">{p.content}</span>
               <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(p.timestamp).toLocaleDateString()}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">暂无内容</div>
        )}
      </div>
      
      <div className="mt-8 px-6">
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-red-500 font-medium py-3 bg-white rounded-xl shadow-sm">
           <LogOut size={18} /> 退出登录
        </button>
      </div>
    </div>
  );
};

const CreatePostModal: React.FC<{ isOpen: boolean, onClose: () => void, onPost: (data: Partial<Post>) => void }> = ({ isOpen, onClose, onPost }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>(Category.CONFESSION);
  const [checking, setChecking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setChecking(true);
    const safetyResult = await checkContentSafety(content);
    setChecking(false);

    if (!safetyResult.safe) {
      alert(`内容包含敏感信息: ${safetyResult.reason || '请修改后重试'}`);
      return;
    }

    onPost({
      content,
      category,
      images: [], // Simplified for demo
    });
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl h-[80vh] sm:h-auto flex flex-col shadow-2xl animate-slide-up pb-safe">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
           <button onClick={onClose} className="text-gray-500">取消</button>
           <span className="font-bold">发布树洞</span>
           <button 
             onClick={handleSubmit} 
             disabled={checking || !content}
             className={`px-4 py-1.5 rounded-full text-sm font-bold text-white ${checking || !content ? 'bg-brand-300' : 'bg-brand-500'}`}
           >
             {checking ? '审核中' : '发布'}
           </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <textarea
            className="w-full h-40 resize-none text-lg outline-none placeholder-gray-300"
            placeholder="这一刻，你想说什么..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.values(Category).filter(c => c !== Category.ALL).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  category === cat ? 'bg-brand-100 text-brand-600 border border-brand-200' : 'bg-gray-100 text-gray-500 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-4 gap-4">
             <button className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1 hover:bg-gray-100">
               <ImageIcon size={24} />
               <span className="text-[10px]">照片</span>
             </button>
             <button className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1 hover:bg-gray-100">
               <Video size={24} />
               <span className="text-[10px]">视频</span>
             </button>
             <button className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1 hover:bg-gray-100">
               <Mic size={24} />
               <span className="text-[10px]">语音</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Don't show nav on chat detail or login
  if (location.pathname.startsWith('/chat/') || location.pathname === '/login') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 w-full flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-white border-t border-gray-100 pointer-events-auto pb-safe">
        <div className="grid grid-cols-5 items-center h-16 px-2">
          <Link to="/" className={`flex flex-col items-center justify-center gap-1 h-full ${isActive('/') ? 'text-brand-500' : 'text-gray-400'}`}>
            <HomeIcon size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">树洞</span>
          </Link>

          <Link to="/radio" className={`flex flex-col items-center justify-center gap-1 h-full ${isActive('/radio') ? 'text-brand-500' : 'text-gray-400'}`}>
            <RadioIcon size={24} strokeWidth={isActive('/radio') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">电台</span>
          </Link>
          
          {/* Center FAB */}
          <div className="relative flex justify-center items-center h-full">
            <Link to="/create" className="absolute -top-6 flex items-center justify-center w-14 h-14 bg-brand-500 text-white rounded-full shadow-lg shadow-brand-200 hover:scale-105 transition-transform border-4 border-gray-50">
              <PlusCircle size={28} />
            </Link>
          </div>

          <Link to="/messages" className={`flex flex-col items-center justify-center gap-1 h-full ${isActive('/messages') ? 'text-brand-500' : 'text-gray-400'}`}>
            <div className="relative">
              <MessageSquare size={24} strokeWidth={isActive('/messages') ? 2.5 : 2} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            </div>
            <span className="text-[10px] font-medium">消息</span>
          </Link>

          <Link to="/profile" className={`flex flex-col items-center justify-center gap-1 h-full ${isActive('/profile') ? 'text-brand-500' : 'text-gray-400'}`}>
            <UserIcon size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">我的</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

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
              {/* Route for Create Modal simulation using navigation trick or state */}
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