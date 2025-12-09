import React, { useState, useRef } from 'react';
import { Post, Category } from '../types';
import { Image as ImageIcon, X } from 'lucide-react';
import { uploadFile } from '../services/postService';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (data: Partial<Post>) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPost }) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imageUrls.length >= 9) {
      alert("最多只能上传9张图片");
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadFile(file);
      // Assuming the backend returns paths relative to the server root
      const fullUrl = `http://localhost:8080${response.path}`;
      setImageUrls(prev => [...prev, fullUrl]);
    } catch (error) {
      console.error("File upload failed:", error);
      alert("文件上传失败");
    } finally {
      setIsUploading(false);
      // Reset file input
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim() && imageUrls.length === 0) return;

    // The backend now handles content safety.
    onPost({
      content,
      // The backend expects an array of tag names, not a single string
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      images: imageUrls,
      // The backend now determines the type based on content, but we'll send it
      category: imageUrls.length > 0 ? Category.IMAGE : Category.CONFESSION,
    });
    // Reset state and close
    setContent('');
    setTags('');
    setImageUrls([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl h-[90vh] sm:h-auto flex flex-col shadow-2xl animate-slide-up pb-safe">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
           <button onClick={onClose} className="text-gray-500">取消</button>
           <span className="font-bold">发布新内容</span>
           <button 
             onClick={handleSubmit} 
             disabled={isUploading || (!content.trim() && imageUrls.length === 0)}
             className={`px-4 py-1.5 rounded-full text-sm font-bold text-white transition-colors ${isUploading || (!content.trim() && imageUrls.length === 0) ? 'bg-brand-300' : 'bg-brand-500'}`}
           >
             {isUploading ? '上传中...' : '发布'}
           </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <textarea
            className="w-full h-32 resize-none text-lg outline-none placeholder-gray-300"
            placeholder="这一刻，你想说什么..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />

          <div className="mb-4">
            <input
              type="text"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-200 outline-none"
              placeholder="添加标签，用逗号分隔"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <img src={url} alt={`upload-preview-${index}`} className="w-full h-full object-cover" />
                <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5">
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}

            {imageUrls.length < 9 && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1 hover:bg-gray-100 disabled:opacity-50"
              >
                <ImageIcon size={24} />
                <span className="text-[10px]">照片</span>
                {isUploading && <span className="text-[10px]">...</span>}
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
      </div>
    </div>
  );
};