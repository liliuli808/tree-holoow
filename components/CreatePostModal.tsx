import React, { useState } from 'react';
import { Post, Category } from '../types';
import { Image as ImageIcon, Video, Mic } from 'lucide-react';
import { checkContentSafety } from '../services/geminiService';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (data: Partial<Post>) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPost }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>(Category.CONFESSION);
  const [checking, setChecking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setChecking(true);
    const safetyResult = await checkContentSafety(content);
    setChecking(false);

    if (!safetyResult.safe) {
      alert(`内容包含敏感信息: ${safetyResult.reason || '请修改后重试'}`);
      return;
    }

    onPost({
      content,
      category,
      images: [], // Simplified for demo
    });
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl h-[80vh] sm:h-auto flex flex-col shadow-2xl animate-slide-up pb-safe">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
           <button onClick={onClose} className="text-gray-500">取消</button>
           <span className="font-bold">发布树洞</span>
           <button 
             onClick={handleSubmit} 
             disabled={checking || !content}
             className={`px-4 py-1.5 rounded-full text-sm font-bold text-white ${checking || !content ? 'bg-brand-300' : 'bg-brand-500'}`}
           >
             {checking ? '审核中' : '发布'}
           </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <textarea
            className="w-full h-40 resize-none text-lg outline-none placeholder-gray-300"
            placeholder="这一刻，你想说什么..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.values(Category).filter(c => c !== Category.ALL).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  category === cat ? 'bg-brand-100 text-brand-600 border border-brand-200' : 'bg-gray-100 text-gray-500 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-4 gap-4">
             <button className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1 hover:bg-gray-100">
               <ImageIcon size={24} />
               <span className="text-[10px]">照片</span>
             </button>
             <button className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1 hover:bg-gray-100">
               <Video size={24} />
               <span className="text-[10px]">视频</span>
             </button>
             <button className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1 hover:bg-gray-100">
               <Mic size={24} />
               <span className="text-[10px]">语音</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};