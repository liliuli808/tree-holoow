import React, { useState, useEffect, useRef } from 'react';
import { Post, Category } from '../types';
import { PostCard } from '../components/PostCard';
import { TagCloud } from '../components/TagCloud';
import { Ghost, Loader2 } from 'lucide-react';

interface HomeProps {
  posts: Post[];
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onTagChange?: (tagId: number | undefined) => void;
  tags?: { ID: number; name: string }[];
}



export const Home: React.FC<HomeProps> = ({
  posts,
  onLike,
  onComment,
  loading,
  onLoadMore,
  hasMore,
  isLoadingMore,
  onTagChange,
  tags = []
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.ALL);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Observer ref for infinite scrolling
  const observerTarget = useRef<HTMLDivElement>(null);

  // 直接使用服务器返回的帖子，不在客户端过滤
  const displayedPosts = posts;

  const handleRefresh = async () => {
    if (window.scrollY === 0) {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 1500);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < -50) handleRefresh();
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore, loading, onLoadMore]);

  return (
    <div className="pb-24 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Top Navbar - Enhanced with gradient */}
      <div className="sticky top-0 z-40 bg-gradient-to-br from-white via-primary-50/30 to-white shadow-md backdrop-blur-sm">
        <div className="px-6 py-5 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent tracking-tight">树洞</h1>
          <div className="text-xs text-gray-500 mt-1.5 font-medium tracking-wide">匿名 · 真实 · 温暖</div>
        </div>
      </div>

      {/* Tag Cloud - Main Category Display */}
      <TagCloud
        categories={Object.values(Category)}
        activeCategory={activeCategory}
        onCategoryClick={(cat) => {
          setActiveCategory(cat as Category);
          // 通知父组件 tag 变化
          if (cat === Category.ALL) {
            onTagChange?.(undefined);
          } else {
            // 从 tags 列表中查找对应的 tagId
            const foundTag = tags.find(t => t.name === cat);
            onTagChange?.(foundTag?.ID);
          }
        }}
      />

      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="flex justify-center py-4 bg-white text-gray-400 text-sm animate-pulse">
          刷新中...
        </div>
      )}

      {/* Feed List - 2-column Grid */}
      <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl px-4">
        {loading ? (
          <div className="p-8 flex justify-center text-gray-400">
            <Loader2 className="animate-spin text-primary-500" size={32} />
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <Ghost size={48} className="mb-4 opacity-20" />
            <p>这里还很空旷，来发第一条树洞吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-8">
            {displayedPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={onLike}
                onComment={onComment}
                variant="thumbnail"
              />
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger / Loading Indicator */}
        <div ref={observerTarget} className="h-16 flex items-center justify-center text-xs text-gray-400 py-4">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <Loader2 size={16} className="animate-spin text-primary-500" />
              <span className="text-primary-600 font-medium">加载更多...</span>
            </div>
          ) : hasMore ? (
            <span className="opacity-0">Trigger Load</span>
          ) : (
            displayedPosts.length > 0 && (
              <div className="text-gray-300 font-medium">~ 到底啦 ~</div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
