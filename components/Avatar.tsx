import React from 'react';

export const Avatar = ({ url, size = 'md' }: { url: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };
  return (
    <img
      src={url}
      alt="Avatar"
      className={`${sizeClasses[size]} rounded-full object-cover border border-gray-100 bg-gray-200`}
    />
  );
};