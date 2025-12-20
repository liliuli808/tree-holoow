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
}



export const Home: React.FC<HomeProps> = ({ posts, onLike, onComment, loading, onLoadMore, hasMore, isLoadingMore }) => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.ALL);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Observer ref for infinite scrolling
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter posts
  const displayedPosts = activeCategory === Category.ALL
    ? posts
    : posts.filter(p => p.category === activeCategory);

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
    <div className="pb-24 bg-white min-h-screen">
      {/* Top Navbar - Minimalist */}
      <div className="sticky top-0 z-40 bg-white shadow-soft">
        <div className="px-6 py-4 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">树洞</h1>
          <div className="text-xs text-gray-400 mt-1">匿名 · 真实 · 温暖</div>
        </div>
      </div>

      {/* Tag Cloud - Main Category Display */}
      <TagCloud
        categories={Object.values(Category)}
        activeCategory={activeCategory}
        onCategoryClick={(cat) => setActiveCategory(cat as Category)}
      />

      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="flex justify-center py-4 bg-white text-gray-400 text-sm animate-pulse">
          刷新中...
        </div>
      )}

      {/* Feed List */}
      <div className="max-w-md mx-auto sm:max-w-xl md:max-w-2xl px-4">
        {loading ? (
          <div className="p-8 flex justify-center text-gray-400">
            <Loader2 className="animate-spin text-primary-500" />
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <Ghost size={48} className="mb-4 opacity-20" />
            <p>这里还很空旷，来发第一条树洞吧</p>
          </div>
        ) : (
          displayedPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={onLike}
              onComment={onComment}
            />
          ))
        )}

        {/* Infinite Scroll Trigger / Loading Indicator */}
        <div ref={observerTarget} className="h-16 flex items-center justify-center text-xs text-gray-300 py-4">
          {isLoadingMore ? (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              加载更多...
            </div>
          ) : hasMore ? (
            <span className="opacity-0">Trigger Load</span>
          ) : (
            displayedPosts.length > 0 && "~ 到底啦 ~"
          )}
        </div>
      </div>
    </div>
  );
};
