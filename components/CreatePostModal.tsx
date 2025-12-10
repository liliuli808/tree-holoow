import React, { useState, useRef } from 'react';
import { Post, Category } from '../types';
import { Image as ImageIcon, Mic, Video, X } from 'lucide-react';
import { API_BASE_URL, uploadFile } from '../services/postService';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (data: Partial<Post>) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPost }) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'none'>('none');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<Category>(Category.CONFESSION);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  if (!isOpen) return null;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (mediaType === 'image' && imageUrls.length >= 9) {
      alert("最多只能上传9张图片");
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadFile(file);
      const fullUrl = `${API_BASE_URL}${response[0].src}`;
      if (mediaType === 'image') {
        setImageUrls(prev => [...prev, fullUrl]);
      } else if (mediaType === 'video') {
        setVideoUrl(fullUrl);
      }
    } catch (error) {
      console.error("File upload failed:", error);
      alert("文件上传失败");
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const removeVideo = () => setVideoUrl(null);
  const removeAudio = () => setAudioUrl(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        setAudioChunks(prev => [...prev, event.data]);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("无法访问麦克风");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });
        setIsUploading(true);
        try {
          const response = await uploadFile(audioFile);
          const fullUrl = `${API_BASE_URL}${response[0].src}`;
          setAudioUrl(fullUrl);
        } catch (error) {
          console.error("Audio upload failed:", error);
          alert("语音上传失败");
        } finally {
          setIsUploading(false);
          setAudioChunks([]);
        }
      };
    }
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setMediaType('audio');
      clearMedia();
      startRecording();
    }
  };
  
  const clearMedia = () => {
      setImageUrls([]);
      setVideoUrl(null);
      setAudioUrl(null);
  }

  const handleMediaButtonClick = (type: 'image' | 'video') => {
      if (mediaType !== type) {
          clearMedia();
      }
      setMediaType(type);
      fileInputRef.current?.click();
  }

  const handleSubmit = async () => {
    if (!content.trim() && imageUrls.length === 0 && !videoUrl && !audioUrl) return;

    onPost({
      content,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      images: imageUrls,
      video: videoUrl,
      audio: audioUrl,
      category: category,
    });
    // Reset state and close
    setContent('');
    setTags('');
    clearMedia();
    setMediaType('none');
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
             disabled={!content.trim() && imageUrls.length === 0 && !videoUrl && !audioUrl}
             className={`px-4 py-1.5 rounded-full text-sm font-bold text-white ${(!content.trim() && imageUrls.length === 0 && !videoUrl && !audioUrl) ? 'bg-brand-300' : 'bg-brand-500'}`}
           >
             {'发布'}
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

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept={mediaType === 'image' ? 'image/*' : 'video/*'}
            multiple={mediaType === 'image'}
          />

          <div className="grid grid-cols-4 gap-4">
             <button onClick={() => handleMediaButtonClick('image')} className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1 hover:bg-gray-100">
               <ImageIcon size={24} />
               <span className="text-[10px]">照片</span>
             </button>
             <button onClick={() => handleMediaButtonClick('video')} className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1 hover:bg-gray-100">
               <Video size={24} />
               <span className="text-[10px]">视频</span>
             </button>
             <button onClick={handleVoiceClick} className={`aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1 hover:bg-gray-100 ${isRecording ? 'text-red-500' : ''}`}>
               <Mic size={24} />
               <span className="text-[10px]">{isRecording ? '录音中...' : '语音'}</span>
             </button>
          </div>
            
          {isUploading && <p>上传中...</p>}

          <div className="mt-4">
            {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                            <img src={url} alt={`upload-preview ${index}`} className="w-full h-full object-cover rounded-lg" />
                            <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {videoUrl && (
                <div className="relative">
                    <video src={videoUrl} controls className="w-full rounded-lg"></video>
                    <button onClick={removeVideo} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                        <X size={12} />
                    </button>
                </div>
            )}
            {audioUrl && (
                <div className="relative">
                    <audio src={audioUrl} controls className="w-full"></audio>
                    <button onClick={removeAudio} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                        <X size={12} />
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};