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
        if (file.type.startsWith('image/')) {
          setImageUrls([fullUrl]); // Only one cover allowed
        } else {
          setVideoUrl(fullUrl);
        }
      }
    } catch (error) {
      console.error("File upload failed:", error);
      alert("文件上传失败");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

      // Use a local array to collect chunks to avoid closure issues
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());

        if (chunks.length === 0) {
          alert("录音失败，请重试");
          return;
        }

        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
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
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("无法访问麦克风");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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

  const handleMediaButtonClick = (type: 'image' | 'video' | 'cover') => {
    if (type !== 'cover' && mediaType !== type) {
      clearMedia();
    }

    if (type !== 'cover') {
      setMediaType(type as 'image' | 'video');
    }

    const input = fileInputRef.current;
    if (input) {
      input.accept = (type === 'image' || type === 'cover') ? 'image/*' : 'video/*';
      input.multiple = type === 'image';
      input.click();
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() && imageUrls.length === 0 && !videoUrl && !audioUrl) return;

    // Use the selected category as the tag

    // 视频模式下，imageUrls[0] 是封面图
    const coverUrl = mediaType === 'video' && imageUrls.length > 0 ? imageUrls[0] : undefined;
    const imagesToSend = mediaType === 'image' ? imageUrls : [];

    onPost({
      content,
      tag: {  // Send as single tag object (one-to-one relationship)
        id: Date.now().toString(),
        name: category
      },
      images: imagesToSend,
      video: videoUrl,
      audio: audioUrl,
      cover: coverUrl,
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
            className={`px-4 py-1.5 rounded-full text-sm font-bold text-white ${(!content.trim() && imageUrls.length === 0 && !videoUrl && !audioUrl) ? 'bg-primary-300' : 'bg-primary-500'}`}
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
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${category === cat ? 'bg-primary-100 text-primary-600 border border-primary-200' : 'bg-gray-100 text-gray-500 border border-transparent'}
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

          {isUploading && (
            <div className="flex items-center justify-center gap-3 bg-primary-50 border border-primary-200 rounded-2xl p-4 mt-4 animate-fade-in">
              <div className="relative">
                <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-8 h-8 border-3 border-transparent border-t-primary-300 rounded-full animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
              </div>
              <div className="flex flex-col">
                <span className="text-primary-700 font-medium text-sm">正在上传</span>
                <div className="flex gap-1 mt-1">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

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
              <div className="space-y-3">
                <div className="relative">
                  <video src={videoUrl} controls className="w-full rounded-lg bg-black aspect-video"></video>
                  <button onClick={removeVideo} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg">
                    <X size={14} />
                  </button>
                </div>

                {/* Video Cover logic */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-700">视频封面</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">上传一张图片作为帖子列表中的封面图</p>
                  </div>
                  {imageUrls.length > 0 ? (
                    <div className="relative w-24 h-16 shrink-0">
                      <img src={imageUrls[0]} alt="Cover" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                      <button onClick={() => setImageUrls([])} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md">
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMediaButtonClick('cover')}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                    >
                      选择封面
                    </button>
                  )}
                </div>
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