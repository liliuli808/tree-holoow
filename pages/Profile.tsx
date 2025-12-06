import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { User, Post } from '../types';
import { Avatar } from '../components/Avatar';

export const Profile: React.FC<{ user: User, posts: Post[], onLogout: () => void }> = ({ user, posts, onLogout }) => {
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