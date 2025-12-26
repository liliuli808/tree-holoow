import React, { useState } from 'react';
import { Post } from '../types';
import { Heart, MessageCircle, MessageSquare, MoreHorizontal, Play, Pause, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar';
import { MediaViewer } from './MediaViewer';
import { ChatButton } from './ChatButton';

export const Tag = ({ text }: { text: string }) => (
  <span className="inline-block bg-primary-50 text-primary-600 text-xs px-2.5 py-1 rounded-full font-medium">
    #{text}
  </span>
);

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  variant?: 'full' | 'thumbnail';
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, variant = 'full' }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  const isThumbnail = variant === 'thumbnail';
  const shouldTruncate = post.content.length > (isThumbnail ? 40 : 100);
  const displayContent = isExpanded ? post.content : post.content.slice(0, isThumbnail ? 40 : 100) + (shouldTruncate ? '...' : '');

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

  if (isThumbnail) {
    return (
      <>
        <div
          className="bg-white rounded-3xl overflow-hidden shadow-soft cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
          onClick={handleCardClick}
        >
          <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
            {post.images.length > 0 ? (
              <img
                src={post.images[0]}
                className="w-full h-full object-cover"
                alt="thumbnail"
                onClick={(e) => {
                  e.stopPropagation();
                  setMediaViewer({ url: post.images[0], type: 'image' });
                }}
              />
            ) : post.videoUrl || post.type === 'video' ? (
              <div
                className="w-full h-full flex items-center justify-center bg-black/90"
                onClick={(e) => {
                  e.stopPropagation();
                  setMediaViewer({ url: post.videoUrl || '', type: 'video' });
                }}
              >
                {post.cover ? (
                  <img
                    src={post.cover}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    alt="video cover"
                  />
                ) : (
                  <img
                    src={`https://picsum.photos/seed/${post.id}/300/400`}
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                    alt="video preview"
                  />
                )}
                <Play className="text-white opacity-80 relative z-10" size={32} fill="currentColor" />
              </div>
            ) : post.audioUrl || post.type === 'audio' ? (
              <div
                className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 p-4"
                onClick={toggleAudio}
              >
                {/* Hidden audio element */}
                <audio
                  ref={audioRef}
                  src={post.audioUrl}
                  onEnded={() => setIsPlayingAudio(false)}
                />
                {/* Play/Pause Button */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg transition-all ${isPlayingAudio ? 'bg-primary-600 scale-110' : 'bg-primary-500'}`}>
                  {isPlayingAudio ? (
                    <Pause className="text-white" size={28} fill="currentColor" />
                  ) : (
                    <Play className="text-white ml-1" size={28} fill="currentColor" />
                  )}
                </div>
                {/* Wave Animation */}
                <div className="flex items-center gap-0.5 h-6 mb-2">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-primary-400 rounded-full transition-all ${isPlayingAudio ? 'animate-pulse' : ''}`}
                      style={{
                        height: isPlayingAudio ? `${Math.random() * 16 + 8}px` : '6px',
                        animationDelay: `${i * 50}ms`
                      }}
                    />
                  ))}
                </div>
                <p className="text-primary-700 text-xs text-center font-medium">
                  {isPlayingAudio ? '播放中...' : '点击播放'}
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4 relative">
                {/* Decorative quote mark */}
                <div className="absolute top-3 left-3 text-4xl text-primary-200 font-serif leading-none">"</div>
                {/* Main text content */}
                <div className="flex-1 flex items-center justify-center px-2 pt-4">
                  <p className="text-primary-900 text-sm text-center leading-relaxed line-clamp-[8] font-medium">
                    {post.content}
                  </p>
                </div>
                {/* Bottom decorative line */}
                <div className="flex justify-center mt-2">
                  <div className="w-8 h-0.5 bg-primary-300 rounded-full"></div>
                </div>
              </div>
            )}
            {post.tag && (
              <div className="absolute top-2 left-2">
                <span className="bg-white/80 backdrop-blur-md text-primary-600 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                  #{post.tag.name}
                </span>
              </div>
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <p className="text-gray-800 text-sm font-medium line-clamp-3 leading-relaxed">
              {post.content || (post.type === 'video' ? '精彩视频' : post.type === 'audio' ? '语音分享' : '美图分享')}
            </p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar url={post.userAvatar} size="sm" />
                <span className="text-xs text-gray-500 truncate">{post.userNickname}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Heart size={14} fill={post.isLiked ? "#f87171" : "none"} className={post.isLiked ? "text-red-400" : ""} />
                <span className="text-xs font-bold">{post.likes || 0}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Full Screen Viewer for thumbnail mode */}
        {mediaViewer && (
          <MediaViewer
            url={mediaViewer.url}
            type={mediaViewer.type}
            onClose={() => setMediaViewer(null)}
          />
        )}
      </>
    );
  }

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
          <ChatButton userId={parseInt(post.userId)} userName={post.userNickname} />
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
          <div className={`grid gap-2 mb-3 ${post.images.length === 1 ? 'grid-cols-1' :
            post.images.length === 2 ? 'grid-cols-2' :
              post.images.length === 4 ? 'grid-cols-2 w-2/3' : 'grid-cols-3'
            }`}>
            {post.images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setMediaViewer({ url: img, type: 'image' })}
                className={`relative overflow-hidden rounded-2xl bg-gray-100 cursor-pointer active:scale-95 transition-all hover:brightness-90 ${post.images.length === 1 ? 'aspect-video max-h-72 w-full' : 'aspect-square'
                  }`}
              >
                <img
                  src={img}
                  alt={`Post media ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Overlay for long images or to add depth */}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl" />

                {post.isLivePhoto && idx === 0 && (
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></div>
                    LIVE
                  </div>
                )}

                {/* If more than 9 images, show a "+N" overlay on the last visible one */}
                {idx === 2 && post.images.length > 3 && post.images.length !== 4 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-lg pointer-events-none">
                    +{post.images.length - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Video Placeholder */}
        {(post.videoUrl || post.type === 'video') && (
          <div
            onClick={() => setMediaViewer({ url: post.videoUrl || '', type: 'video' })}
            className="relative w-full aspect-video bg-black rounded-2xl mb-3 flex items-center justify-center overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:ring-2 hover:ring-primary-400"
          >
            {/* Use cover image if available, else fallback to picsum */}
            <img
              src={post.cover || `https://picsum.photos/seed/${post.id}/600/400?grayscale`}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              alt="Video thumbnail"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <button className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border-2 border-white/30 hover:bg-white/30 hover:scale-110 transition-all shadow-lg">
              <Play fill="currentColor" size={28} className="ml-1" />
            </button>
            <div className="absolute bottom-3 right-3 text-white text-[10px] font-bold bg-black/60 px-2 py-1 rounded-full backdrop-blur-sm uppercase tracking-wider">
              VIDEO
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