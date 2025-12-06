import React, { useState } from 'react';
import { Post } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, Pause } from 'lucide-react';
import { Avatar } from './Avatar';
import { MediaViewer } from './MediaViewer';

export const Tag = ({ text }: { text: string }) => (
  <span className="inline-block bg-brand-50 text-brand-600 text-xs px-2 py-0.5 rounded-full font-medium mr-2">
    #{text}
  </span>
);

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  const shouldTruncate = post.content.length > 100;
  const displayContent = isExpanded ? post.content : post.content.slice(0, 100) + (shouldTruncate ? '...' : '');

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="bg-white p-4 mb-2 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <Avatar url={post.userAvatar} />
            <div>
              <div className="font-bold text-gray-800 text-sm">{post.userNickname}</div>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <span>{formatTime(post.timestamp)}</span>
                {post.category && <Tag text={post.category} />}
              </div>
            </div>
          </div>
          <button className="text-gray-400">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
            {displayContent}
            {shouldTruncate && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-brand-500 ml-1 font-medium"
              >
                {isExpanded ? '收起' : '全文'}
              </button>
            )}
          </p>
        </div>

        {/* Media Grid */}
        {post.images.length > 0 && (
          <div className={`grid gap-1 mb-3 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {post.images.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setMediaViewer({ url: img, type: 'image' })}
                className={`relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer active:opacity-90 transition-opacity ${post.images.length === 1 ? 'aspect-video max-h-60' : 'aspect-square'}`}
              >
                 <img src={img} alt="Post media" className="w-full h-full object-cover" />
                 {post.isLivePhoto && idx === 0 && (
                   <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1 pointer-events-none">
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
            className="relative w-full aspect-video bg-black rounded-lg mb-3 flex items-center justify-center overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
          >
            <img src={`https://picsum.photos/seed/${post.id}/600/400?grayscale`} className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <button className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/50">
              <Play fill="currentColor" size={20} className="ml-1" />
            </button>
            <div className="absolute bottom-2 right-2 text-white text-xs font-medium bg-black/60 px-2 py-0.5 rounded">
              0:45
            </div>
          </div>
        )}

        {/* Audio Placeholder */}
        {post.audioUrl && (
          <div 
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="flex items-center gap-3 bg-brand-50 p-3 rounded-xl mb-3 w-3/4 cursor-pointer"
          >
            <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white shrink-0">
              {isPlayingAudio ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5"/>}
            </div>
            <div className="flex-1 h-8 flex items-center gap-0.5">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 bg-brand-300 rounded-full transition-all duration-300 ${isPlayingAudio ? 'animate-pulse' : ''}`}
                  style={{ height: `${Math.random() * 16 + 8}px` }} 
                />
              ))}
            </div>
            <span className="text-brand-600 text-xs font-medium">18"</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between text-gray-500 pt-2 border-t border-gray-50">
          <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 ${post.isLiked ? 'text-red-500' : ''}`}
          >
            <Heart size={20} fill={post.isLiked ? "currentColor" : "none"} />
            <span className="text-xs">{post.likes || '赞'}</span>
          </button>
          <button 
            onClick={() => onComment(post.id)}
            className="flex items-center gap-1.5"
          >
            <MessageCircle size={20} />
            <span className="text-xs">{post.comments.length || '评论'}</span>
          </button>
          <button className="flex items-center gap-1.5">
            <Share2 size={20} />
            <span className="text-xs">分享</span>
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