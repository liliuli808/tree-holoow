import React from 'react';
import { Category } from '../types';

interface TagCloudProps {
  categories: string[];
  activeCategory: string;
  onCategoryClick: (category: string) => void;
}

// Tag sizes based on importance/weight - creates visual rhythm
const TAG_SIZES = {
  large: 'text-lg px-5 py-2.5',
  medium: 'text-base px-4 py-2',
  small: 'text-sm px-3 py-1.5',
};

// Assign sizes to create varied visual hierarchy
const getCategorySize = (index: number): string => {
  const sizePattern = ['large', 'medium', 'small', 'medium', 'large', 'small', 'medium', 'small'];
  const sizeKey = sizePattern[index % sizePattern.length] as keyof typeof TAG_SIZES;
  return TAG_SIZES[sizeKey];
};

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
    <div className="flex flex-wrap gap-2 justify-center items-center p-6 bg-white">
      {categories.map((category, index) => {
        const isActive = activeCategory === category;
        const size = getCategorySize(index);
        const colorScheme = TAG_COLORS[index % TAG_COLORS.length];
        
        return (
          <button
            key={category}
            onClick={() => onCategoryClick(category)}
            className={`
              ${size}
              ${isActive ? `${colorScheme.activeBg} ${colorScheme.activeText}` : `${colorScheme.bg} ${colorScheme.text}`}
              rounded-full
              font-medium
              transition-all
              duration-300
              hover:scale-105
              hover:shadow-soft-lg
              active:scale-95
              border-2
              ${isActive ? 'border-transparent shadow-soft-lg' : 'border-transparent'}
            `}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};
