import React from 'react';
import { X } from 'lucide-react';

export const MediaViewer = ({ url, type, onClose }: { url: string; type: 'image' | 'video'; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
      <div className="absolute top-4 right-4 z-10 safe-top">
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          className="bg-white/20 hover:bg-white/30 p-2 rounded-full text-white backdrop-blur-sm transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      <div className="w-full h-full p-2 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {type === 'image' ? (
          <img src={url} alt="Full screen" className="max-w-full max-h-full object-contain" />
        ) : (
          <video src={url} controls autoPlay className="max-w-full max-h-full" />
        )}
      </div>
    </div>
  );
};