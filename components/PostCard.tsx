import React, { useState } from 'react';
import { Post } from '../types';
import { Heart, MessageCircle, MessageSquare, MoreHorizontal, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar';
import { MediaViewer } from './MediaViewer';

export const Tag = ({ text }: { text: string }) => (
  <span className="inline-block bg-primary-50 text-primary-600 text-xs px-2.5 py-1 rounded-full font-medium">
    #{text}
  </span>
);

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  const shouldTruncate = post.content.length > 100;
  const displayContent = isExpanded ? post.content : post.content.slice(0, 100) + (shouldTruncate ? '...' : '');

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button') || target.tagName === 'IMG') {
      return;
    }
    navigate(`/post/${post.id}`);
  };

  return (
    <>
      <div className="bg-white p-5 mb-4 shadow-soft rounded-3xl cursor-pointer" onClick={handleCardClick}>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <Avatar url={post.userAvatar} />
            <div>
              <div className="font-semibold text-gray-800 text-sm">{post.userNickname}</div>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <span>{formatTime(post.timestamp)}</span>
                {post.tag && <Tag text={post.tag.name} />}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement private message functionality
              console.log('Private message:', post.userNickname);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MessageSquare size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
            {displayContent}
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary-500 ml-1 font-medium hover:text-primary-600 transition-colors"
              >
                {isExpanded ? '收起' : '全文'}
              </button>
            )}
          </p>
        </div>

        {/* Media Grid */}
        {post.images.length > 0 && (
          <div className={`grid gap-2 mb-3 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {post.images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setMediaViewer({ url: img, type: 'image' })}
                className={`relative overflow-hidden rounded-2xl bg-gray-50 cursor-pointer active:opacity-90 transition-opacity ${post.images.length === 1 ? 'aspect-video max-h-60' : 'aspect-square'}`}
              >
                <img src={img} alt="Post media" className="w-full h-full object-cover" />
                {post.isLivePhoto && idx === 0 && (
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                    LIVE
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Video Placeholder */}
        {post.videoUrl && (
          <div
            onClick={() => setMediaViewer({ url: post.videoUrl!, type: 'video' })}
            className="relative w-full aspect-video bg-black rounded-2xl mb-3 flex items-center justify-center overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
          >
            <img src={`https://picsum.photos/seed/${post.id}/600/400?grayscale`} className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <button className="relative z-10 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border-2 border-white/50 hover:scale-110 transition-transform">
              <Play fill="currentColor" size={22} className="ml-1" />
            </button>
            <div className="absolute bottom-3 right-3 text-white text-xs font-medium bg-black/60 px-2 py-1 rounded-lg">
              0:45
            </div>
          </div>
        )}

        {/* Audio Placeholder */}
        {post.audioUrl && (
          <div
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="flex items-center gap-3 bg-primary-50 p-4 rounded-2xl mb-3 w-3/4 cursor-pointer hover:bg-primary-100 transition-colors"
          >
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white shrink-0 hover:bg-primary-600 transition-colors">
              {isPlayingAudio ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            </div>
            <div className="flex-1 h-8 flex items-center gap-0.5">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-primary-300 rounded-full transition-all duration-300 ${isPlayingAudio ? 'animate-pulse' : ''}`}
                  style={{ height: `${Math.random() * 16 + 8}px` }}
                />
              ))}
            </div>
            <span className="text-primary-600 text-xs font-medium">18"</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between text-gray-400 pt-3 border-t border-gray-50">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 transition-colors ${post.isLiked ? 'text-red-400' : 'hover:text-red-400'}`}
          >
            <Heart size={20} fill={post.isLiked ? "currentColor" : "none"} />
            <span className="text-xs">{post.likes || '赞'}</span>
          </button>
          <button
            onClick={() => onComment(post.id)}
            className="flex items-center gap-1.5 hover:text-primary-500 transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-xs">{post.comments.length || '评论'}</span>
          </button>
        </div>
      </div>

      {/* Full Screen Viewer */}
      {mediaViewer && (
        <MediaViewer
          url={mediaViewer.url}
          type={mediaViewer.type}
          onClose={() => setMediaViewer(null)}
        />
      )}
    </>
  );
};