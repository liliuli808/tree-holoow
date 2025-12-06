import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Heart, Radio as RadioIcon, Volume2, Disc, Sliders } from 'lucide-react';

const CHANNELS = [
  { id: 1, name: '深夜情感', color: 'from-purple-500 to-indigo-900', freq: 'FM 98.6' },
  { id: 2, name: '失眠治愈', color: 'from-blue-400 to-blue-800', freq: 'FM 88.0' },
  { id: 3, name: '怀旧金曲', color: 'from-amber-500 to-red-900', freq: 'FM 101.1' },
  { id: 4, name: '雨天特调', color: 'from-slate-500 to-slate-800', freq: 'FM 92.5' },
];

export const Radio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(CHANNELS[0]);
  const [progress, setProgress] = useState(0);

  // Simulate progress bar
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 0.5));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentChannel.color} text-white pb-24 transition-colors duration-1000`}>
      {/* Header */}
      <div className="flex justify-between items-center p-6 pt-10">
        <div className="flex flex-col">
          <span className="text-xs font-bold opacity-60 tracking-widest">TREE HOLLOW RADIO</span>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <RadioIcon size={20} className="animate-pulse" />
            {currentChannel.freq}
          </h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
          <Sliders size={18} />
        </button>
      </div>

      {/* Main Player */}
      <div className="flex flex-col items-center justify-center mt-8 mb-12">
        {/* Disc */}
        <div className="relative w-72 h-72 mb-10">
          <div className={`absolute inset-0 rounded-full border-4 border-white/10 shadow-2xl flex items-center justify-center overflow-hidden bg-black ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
             <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/vinyl/800/800')] opacity-60 bg-cover bg-center"></div>
             <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-full z-10 border border-gray-700 flex items-center justify-center">
                <Disc size={40} className="text-gray-500" />
             </div>
             {/* Glint */}
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
          </div>
          {/* Tone Arm (Stylized) */}
          <div className={`absolute -top-4 -right-4 w-6 h-24 bg-gray-300 rounded-full origin-top transform transition-transform duration-500 shadow-xl border-2 border-gray-400 ${isPlaying ? 'rotate-12' : '-rotate-12'}`}></div>
        </div>

        {/* Info */}
        <div className="text-center space-y-2 px-8">
          <h2 className="text-2xl font-bold truncate w-64 mx-auto">匿名树洞 - {currentChannel.name}</h2>
          <p className="text-white/60 text-sm">正在播放：来自远方的思念.mp3</p>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8">
        <div className="w-full bg-white/20 h-1 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex items-center justify-between max-w-xs mx-auto mb-10">
          <button className="text-white/70 hover:text-white transition-colors">
            <SkipBack size={28} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          <button className="text-white/70 hover:text-white transition-colors">
            <SkipForward size={28} />
          </button>
        </div>

        <div className="flex items-center justify-between text-white/80">
           <button className="flex flex-col items-center gap-1">
             <Heart size={20} />
             <span className="text-[10px]">收藏</span>
           </button>
           <button className="flex flex-col items-center gap-1">
             <Volume2 size={20} />
             <span className="text-[10px]">音效</span>
           </button>
        </div>
      </div>

      {/* Channel List */}
      <div className="mt-8 px-6">
        <h3 className="text-xs font-bold text-white/50 mb-4 uppercase tracking-wider">切换频道</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {CHANNELS.map(channel => (
            <button 
              key={channel.id}
              onClick={() => setCurrentChannel(channel)}
              className={`flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br ${channel.color} border-2 ${currentChannel.id === channel.id ? 'border-white' : 'border-transparent opacity-60'} flex flex-col items-center justify-center shadow-lg transition-all`}
            >
              <RadioIcon size={20} className="mb-2" />
              <span className="text-xs font-bold">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};