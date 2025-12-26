import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Share2, MapPin, Mars, Venus, ChevronRight, Grid, Bookmark, Heart } from 'lucide-react';
import { getProfile, UserProfile } from '../services/userService';
import { PostCard } from '../components/PostCard';
import { Post, Category } from '../types';

// Mock data removed


export const MyProfile: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'notes' | 'collect' | 'likes'>('notes');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await getProfile();
            setProfile(data);
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    // Default background if none set
    const backgroundStyle = profile?.background_url
        ? { backgroundImage: `url(${profile.background_url})` }
        : { backgroundImage: 'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80)' };

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header / Background Area */}
            <div className="relative">
                {/* Top Navigation Bar */}
                <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-transparent">
                    <button
                        onClick={() => navigate(-1)} // Or open a side menu
                        className="w-10 h-10 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-full text-white"
                    >
                        <Settings size={20} />
                    </button>
                    <button
                        className="w-10 h-10 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-full text-white"
                    >
                        <Share2 size={20} />
                    </button>
                </div>

                {/* Cover Image */}
                <div
                    className="h-48 w-full bg-cover bg-center relative"
                    style={backgroundStyle}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/10"></div>
                </div>

                {/* Profile Info Card Area - Overlap with Cover */}
                <div className="px-5 -mt-10 relative z-10">
                    <div className="flex justify-between items-end mb-3">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full p-1 bg-white">
                                <img
                                    src={profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover border border-gray-100"
                                />
                            </div>
                            {/* Verified Badge Mockup (Optional) */}
                            {/* <div className="absolute bottom-1 right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">✓</div> */}
                        </div>

                        {/* Edit Profile Button */}
                        <div className="mb-2 flex gap-2">
                            <button className="px-6 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium border border-gray-200">
                                🔔
                            </button>
                            <button
                                onClick={() => navigate('/profile/edit')}
                                className="px-6 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium border border-gray-200"
                            >
                                编辑资料
                            </button>
                            <button className="p-1.5 bg-gray-100 text-gray-800 rounded-full border border-gray-200">
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Name and ID */}
                    <div className="mb-3">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                            {profile?.nickname || '小红薯_User'}
                        </h1>
                        <div className="flex items-center text-xs text-gray-500 gap-2">
                            <span>小红书号：{String(profile?.id || '').substring(0, 8) || 'unknown'}</span>
                            <span className="p-0.5 bg-gray-100 rounded cursor-pointer">
                                📋
                            </span>
                        </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-800 mb-4 leading-relaxed whitespace-pre-wrap">
                        {profile?.bio || '✨ 热爱生活，记录美好 ✨\n暂无简介'}
                    </p>

                    {/* Tags (Gender, Age, Constellation, Location) */}
                    <div className="flex gap-2 mb-5">
                        {profile?.age && (
                            <div className="flex items-center gap-1 bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full text-xs font-medium">
                                <Mars size={12} /> {/* TODO: Handle Gender Display if available */}
                                <span>{profile.age}岁</span>
                            </div>
                        )}
                        {profile?.location && (
                            <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                <MapPin size={12} />
                                <span>{profile.location}</span>
                            </div>
                        )}
                        {profile?.constellation && (
                            <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                <span>{profile.constellation}</span>
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mb-6">
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-gray-900">{profile?.follow_count ?? 0}</span>
                            <span className="text-xs text-gray-500">关注</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-gray-900">{profile?.fan_count ?? 0}</span>
                            <span className="text-xs text-gray-500">粉丝</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-gray-900">
                                {(profile?.liked_count || 0) + (profile?.collected_count || 0)}
                            </span>
                            <span className="text-xs text-gray-500">获赞与收藏</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Tabs */}
            <div className="sticky top-0 bg-white z-40 border-b border-gray-100 pt-safe">
                <div className="flex justify-around items-center h-12">
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`relative h-full px-4 text-sm font-medium transition-colors ${activeTab === 'notes' ? 'text-gray-900' : 'text-gray-400'
                            }`}
                    >
                        笔记
                        {activeTab === 'notes' && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-red-500 rounded-full"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('collect')}
                        className={`relative h-full px-4 text-sm font-medium transition-colors ${activeTab === 'collect' ? 'text-gray-900' : 'text-gray-400'
                            }`}
                    >
                        收藏
                        {activeTab === 'collect' && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-red-500 rounded-full"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('likes')}
                        className={`relative h-full px-4 text-sm font-medium transition-colors ${activeTab === 'likes' ? 'text-gray-900' : 'text-gray-400'
                            }`}
                    >
                        赞过
                        {activeTab === 'likes' && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-red-500 rounded-full"></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area - Masonry Grid */}
            <div className="p-3">
                {activeTab === 'notes' ? (
                    <div className="columns-2 gap-3 space-y-3">
                        {(profile?.posts || []).map((backendPost: any) => {
                            // Map backend post to frontend Post interface
                            const post: Post = {
                                id: backendPost.ID.toString(),
                                userId: backendPost.user_id?.toString() || '',
                                userNickname: profile?.nickname || 'User', // We know it's our profile
                                userAvatar: profile?.avatar_url || '',
                                category: Category.MOMENT,
                                content: backendPost.text_content,
                                images: backendPost.type === 'text_image' ? backendPost.media_urls || [] : [],
                                videoUrl: backendPost.type === 'video' && backendPost.media_urls?.length ? backendPost.media_urls[0] : undefined,
                                timestamp: new Date(backendPost.CreatedAt).getTime(),
                                likes: backendPost.likes_count || 0,
                                isLiked: backendPost.is_liked || false,
                                comments: [],
                                viewCount: 0,
                                tag: (backendPost.tag && backendPost.tag.name) ? { id: backendPost.tag.ID?.toString(), name: backendPost.tag.name } : { id: '', name: '' },
                                type: backendPost.type,
                                cover: backendPost.cover_url || (backendPost.type === 'video' && backendPost.media_urls?.length ? backendPost.media_urls[0] + '?vframe/jpg/offset/0' : undefined)
                            };

                            return (
                                <div key={post.id} className="break-inside-avoid">
                                    <PostCard
                                        post={post}
                                        onLike={() => { }}
                                        onComment={() => { }}
                                        variant="thumbnail"
                                    />
                                </div>
                            );
                        })}
                        {(!profile?.posts || profile.posts.length === 0) && (
                            <div className="col-span-2 text-center text-gray-400 py-10">
                                还没有发布任何笔记哦
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            {activeTab === 'collect' ? <Bookmark size={40} /> : <Heart size={40} />}
                        </div>
                        <p className="text-sm">这里还是空的哦</p>
                        <button className="mt-4 px-6 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-600">
                            去首页看看
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
