import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  url?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ url, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 28,
  };

  // If no URL or empty URL, show placeholder
  if (!url || url.trim() === '') {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border border-primary-200`}>
        <User size={iconSizes[size]} className="text-white" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="Avatar"
      className={`${sizeClasses[size]} rounded-full object-cover border border-gray-100 bg-gray-200`}
      onError={(e) => {
        // On error, replace with placeholder
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        // Insert placeholder
        const parent = target.parentElement;
        if (parent && !parent.querySelector('.avatar-fallback')) {
          const fallback = document.createElement('div');
          fallback.className = `${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border border-primary-200 avatar-fallback`;
          fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSizes[size]}" height="${iconSizes[size]}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
          parent.appendChild(fallback);
        }
      }}
    />
  );
};