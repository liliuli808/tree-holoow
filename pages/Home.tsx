import React, { useState, useEffect, useRef } from 'react';
import { Post, Category } from '../types';
import { PostCard } from '../components/PostCard';
import { Heart, Gamepad2, Music, Clapperboard, Users, Camera, Flame, Ghost, Loader2 } from 'lucide-react';

interface HomeProps {
  posts: Post[];
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  [Category.LOVE]: <Heart className="text-pink-500" size={24} />,
  [Category.GAME]: <Gamepad2 className="text-blue-500" size={24} />,
  [Category.MUSIC]: <Music className="text-purple-500" size={24} />,
  [Category.MOVIE]: <Clapperboard className="text-red-500" size={24} />,
  [Category.FRIENDS]: <Users className="text-green-500" size={24} />,
  [Category.MOMENT]: <Camera className="text-yellow-500" size={24} />,
  [Category.CONFESSION]: <Flame className="text-orange-500" size={24} />,
  [Category.TRASH]: <Ghost className="text-gray-500" size={24} />,
};

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
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Top Navbar */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
           <h1 className="text-xl font-bold text-gray-900 tracking-tight">树洞</h1>
           <div className="text-xs text-gray-400">匿名 · 真实 · 温暖</div>
        </div>
        
        {/* Horizontal Category Slider */}
        <div className="overflow-x-auto no-scrollbar flex items-center px-4 pb-0 space-x-6 border-b border-gray-100">
           {Object.values(Category).map((cat) => (
             <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeCategory === cat 
                    ? 'border-brand-500 text-brand-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {/* Grid Categories - Only on 'All' tab */}
      {activeCategory === Category.ALL && (
        <div className="bg-white p-4 mb-2 grid grid-cols-4 gap-4">
          {[Category.LOVE, Category.GAME, Category.MUSIC, Category.MOVIE, Category.FRIENDS, Category.MOMENT, Category.CONFESSION, Category.TRASH].map((cat) => (
             <button 
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className="flex flex-col items-center gap-2"
             >
               <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shadow-sm">
                 {CATEGORY_ICONS[cat]}
               </div>
               <span className="text-xs text-gray-600">{cat}</span>
             </button>
          ))}
        </div>
      )}

      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
         <div className="flex justify-center py-4 bg-gray-50 text-gray-400 text-sm animate-pulse">
            刷新中...
         </div>
      )}

      {/* Feed List */}
      <div className="max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {loading ? (
          <div className="p-8 flex justify-center text-gray-400">
             <Loader2 className="animate-spin text-brand-500" />
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
