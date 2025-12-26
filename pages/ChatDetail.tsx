import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, Check, CheckCheck } from 'lucide-react';
import { Message, getMessages, sendMessage } from '../services/chatService';
import { websocketService, WebSocketMessage } from '../services/websocketService';
import { Avatar } from '../components/Avatar';
import { getMediaUrl } from '../services/api';
import { jwtDecode } from 'jwt-decode';

// Get current user ID from token
const getCurrentUserId = (): number => {
  const token = localStorage.getItem('token');
  if (!token) return 0;
  try {
    const decoded: { user_id: number } = jwtDecode(token);
    return decoded.user_id;
  } catch {
    return 0;
  }
};

export const ChatDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const otherUserId = parseInt(id || '0', 10);
  const currentUserId = getCurrentUserId();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<{ nickname: string; avatar_url: string }>({
    nickname: '用户',
    avatar_url: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const msgs = await getMessages(otherUserId);
        // Reverse to show oldest first
        setMessages(msgs.reverse());

        // Get other user info from first message
        if (msgs.length > 0) {
          const firstMsg = msgs[0];
          const other = firstMsg.sender_id === otherUserId ? firstMsg.sender : firstMsg.receiver;
          if (other) {
            setOtherUser({
              nickname: other.nickname || '用户',
              avatar_url: other.avatar_url || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };

    if (otherUserId && currentUserId) {
      loadMessages();
    }
  }, [otherUserId, currentUserId]);

  // Listen for WebSocket messages
  useEffect(() => {
    const unsubscribe = websocketService.onMessage((wsMsg: WebSocketMessage) => {
      if (wsMsg.type === 'message' && wsMsg.message) {
        const msg = wsMsg.message;
        if (
          (msg.sender_id === otherUserId && msg.receiver_id === currentUserId) ||
          (msg.sender_id === currentUserId && msg.receiver_id === otherUserId)
        ) {
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      }
    });

    return unsubscribe;
  }, [currentUserId, otherUserId]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    const content = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const wsSent = websocketService.sendMessage(otherUserId, content);
      if (!wsSent) {
        const msg = await sendMessage(otherUserId, content);
        setMessages(prev => [...prev, msg]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setInputText(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    // Check if date is valid
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with safe area */}
      <div className="sticky top-0 z-40 bg-white shadow-sm pt-safe">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <Avatar url={getMediaUrl(otherUser.avatar_url)} size="sm" />
          <span className="font-medium text-gray-800">{otherUser.nickname}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary-500" size={28} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <p>暂无消息</p>
            <p className="text-sm mt-1">发送一条消息开始聊天吧</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%]`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${isMine
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <span>{formatTime(msg.created_at)}</span>
                    {isMine && (
                      msg.read_at
                        ? <CheckCheck size={14} className="text-primary-400" />
                        : <Check size={14} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-primary-200 text-gray-800 placeholder:text-gray-400"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${inputText.trim() && !sending
              ? 'bg-primary-500 text-white hover:bg-primary-600'
              : 'bg-gray-200 text-gray-400'
              }`}
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};