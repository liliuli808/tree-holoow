import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { ChatSession } from '../types';
import { Avatar } from '../components/Avatar';

export const Messages: React.FC<{ sessions: ChatSession[] }> = ({ sessions }) => {
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