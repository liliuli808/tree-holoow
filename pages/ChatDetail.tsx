import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Mic, Image as ImageIcon, Send } from 'lucide-react';
import { ChatSession, ChatMessage } from '../types';
import { Avatar } from '../components/Avatar';

export const ChatDetail: React.FC<{ sessions: ChatSession[], onSendMessage: (sid: string, text: string) => void, currentUserId: string }> = ({ sessions, onSendMessage, currentUserId }) => {
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