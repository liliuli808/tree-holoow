import React from 'react';
import { Category } from '../types';

interface TagCloudProps {
  categories: string[];
  activeCategory: string;
  onCategoryClick: (category: string) => void;
}

// Color variations for different categories (soft pastel colors)
const TAG_COLORS = [
  { bg: 'bg-primary-50', text: 'text-primary-600', activeBg: 'bg-primary-500', activeText: 'text-white' },
  { bg: 'bg-accent-50', text: 'text-accent-300', activeBg: 'bg-accent-300', activeText: 'text-white' },
  { bg: 'bg-blue-50', text: 'text-blue-500', activeBg: 'bg-blue-400', activeText: 'text-white' },
  { bg: 'bg-purple-50', text: 'text-purple-500', activeBg: 'bg-purple-400', activeText: 'text-white' },
  { bg: 'bg-pink-50', text: 'text-pink-500', activeBg: 'bg-pink-400', activeText: 'text-white' },
  { bg: 'bg-indigo-50', text: 'text-indigo-500', activeBg: 'bg-indigo-400', activeText: 'text-white' },
];

export const TagCloud: React.FC<TagCloudProps> = ({ categories, activeCategory, onCategoryClick }) => {
  return (
    <div className="relative bg-white">
      {/* Horizontal scrollable container */}
      <div className="overflow-x-auto no-scrollbar py-3 px-4">
        <div className="flex gap-2 items-center min-w-min">
          {categories.map((category, index) => {
            const isActive = activeCategory === category;
            const colorScheme = TAG_COLORS[index % TAG_COLORS.length];

            return (
              <button
                key={category}
                onClick={() => onCategoryClick(category)}
                className={`
                  text-sm px-4 py-2
                  ${isActive ? `${colorScheme.activeBg} ${colorScheme.activeText}` : `${colorScheme.bg} ${colorScheme.text}`}
                  rounded-full
                  font-medium
                  transition-all
                  duration-300
                  hover:scale-105
                  hover:shadow-md
                  active:scale-95
                  whitespace-nowrap
                  flex-shrink-0
                  ${isActive ? 'shadow-md' : ''}
                `}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fade-out scroll indicators */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  );
};
