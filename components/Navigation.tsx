import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Radio as RadioIcon, PlusCircle, MessageSquare, User as UserIcon } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Don't show nav on chat detail or login
  if (location.pathname.startsWith('/chat/') || location.pathname === '/login') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 w-full flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-white border-t border-gray-100 pointer-events-auto pb-safe">
        <div className="grid grid-cols-5 items-center h-16 px-2">
          <Link to="/" className={`flex flex-col items-center justify-center gap-1 h-full ${isActive('/') ? 'text-primary-500' : 'text-gray-400'}`}>
            <HomeIcon size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">树洞</span>
          </Link>

          <Link to="/radio" className={`flex flex-col items-center justify-center gap-1 h-full ${isActive('/radio') ? 'text-primary-500' : 'text-gray-400'}`}>
            <RadioIcon size={24} strokeWidth={isActive('/radio') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">电台</span>
          </Link>

          {/* Center FAB */}
          <div className="relative flex justify-center items-center h-full">
            <Link to="/create" className="absolute -top-6 flex items-center justify-center w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg shadow-primary-100 hover:scale-105 transition-transform border-4 border-white">
              <PlusCircle size={28} />
            </Link>
          </div>

          <Link to="/messages" className={`flex flex-col items-center justify-center gap-1 h-full ${isActive('/messages') ? 'text-primary-500' : 'text-gray-400'}`}>
            <div className="relative">
              <MessageSquare size={24} strokeWidth={isActive('/messages') ? 2.5 : 2} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            </div>
            <span className="text-[10px] font-medium">消息</span>
          </Link>

          <Link to="/profile" className={`flex flex-col items-center justify-center gap-1 h-full ${isActive('/profile') ? 'text-primary-500' : 'text-gray-400'}`}>
            <UserIcon size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">我的</span>
          </Link>
        </div>
      </div>
    </div>
  );
};