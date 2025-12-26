import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Conversation, getConversations, getUnreadCount } from '../services/chatService';
import { Avatar } from '../components/Avatar';
import { getMediaUrl } from '../services/api';

export const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    loadConversations();
    loadUnreadCount();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setTotalUnread(count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    if (diff < dayMs) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * dayMs) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return days[date.getDay()];
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header with safe area */}
      <div className="sticky top-0 z-40 bg-white shadow-sm pt-safe">
        <div className="px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900">消息</h1>
          {totalUnread > 0 && (
            <span className="text-sm text-primary-500">{totalUnread} 条未读</span>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white mt-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary-500" size={28} />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <MessageCircle size={48} className="mb-3 opacity-50" />
            <p className="text-base">暂无消息</p>
            <p className="text-sm mt-1">在帖子中点击私信开始聊天</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => navigate(`/chat/${conv.other_user.id}`)}
              className="w-full flex items-center gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="relative">
                <Avatar url={getMediaUrl(conv.other_user.avatar_url)} size="lg" />
                {conv.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {conv.unread_count > 9 ? '9+' : conv.unread_count}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900 truncate">
                    {conv.other_user.nickname || '用户'}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    {formatTime(conv.last_message_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {conv.last_message || '暂无消息'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};