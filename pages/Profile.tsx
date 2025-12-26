import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Loader2, ChevronRight, ArrowLeft } from 'lucide-react';
import { getProfile, updateProfile, UserProfile } from '../services/userService';
import { uploadFile } from '../services/postService';
import { API_BASE_URL, MEDIA_BASE_URL } from '../services/api';
import { RegionPicker } from '../components/RegionPicker';

interface ProfileEditProps {
    onProfileUpdate?: (nickname: string, avatarUrl: string, backgroundUrl: string) => void;
}

export const Profile: React.FC<ProfileEditProps> = ({ onProfileUpdate }) => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<'avatar' | 'background' | null>(null);
    const [nickname, setNickname] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [backgroundUrl, setBackgroundUrl] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [birthday, setBirthday] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [showNicknameEdit, setShowNicknameEdit] = useState(false);
    const [showBioEdit, setShowBioEdit] = useState(false);
    const [showLocationEdit, setShowLocationEdit] = useState(false);
    const [showBirthdayEdit, setShowBirthdayEdit] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Construct full URL by stripping /api/v1 from API_BASE_URL and appending path
        // API_BASE_URL is like http://localhost:8080/api/v1
        const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await getProfile();
            setProfile(data);
            setNickname(data.nickname || '');
            setAvatarUrl(data.avatar_url || '');
            setBackgroundUrl(data.background_url || '');
            setBio(data.bio || '');
            setLocation(data.location || '');
            setBirthday(data.birthday || '');
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError('加载用户信息失败');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'background') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('请上传图片文件');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('图片大小不能超过 5MB');
            return;
        }

        try {
            setUploading(type);
            setError(null);
            const result = await uploadFile(file);
            if (result && result.length > 0) {
                const path = result[0].src;
                const url = `${MEDIA_BASE_URL}${path}`
                // Note: url returned might be relative or absolute depending on service
                if (type === 'avatar') {
                    setAvatarUrl(url); // Store raw URL
                    await saveProfileData({ avatar_url: url });
                } else {
                    setBackgroundUrl(url); // Store raw URL
                    await saveProfileData({ background_url: url });
                }
            }
        } catch (err) {
            console.error(`Failed to upload ${type}:`, err);
            setError(`上传${type === 'avatar' ? '头像' : '背景'}失败`);
        } finally {
            setUploading(null);
        }
    };

    const saveProfileData = async (updates: Partial<{ nickname: string, avatar_url: string, background_url: string, bio: string, location: string, birthday: string }>) => {
        try {
            setSaving(true);
            const updated = await updateProfile({
                nickname: updates.nickname !== undefined ? updates.nickname : nickname,
                avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : avatarUrl,
                background_url: updates.background_url !== undefined ? updates.background_url : backgroundUrl,
                bio: updates.bio !== undefined ? updates.bio : bio,
                location: updates.location !== undefined ? updates.location : location,
                birthday: updates.birthday !== undefined ? updates.birthday : birthday,
            });
            setProfile(updated);
            // Sync state with returned data
            setNickname(updated.nickname || '');
            setAvatarUrl(updated.avatar_url || '');
            setBackgroundUrl(updated.background_url || '');
            setBio(updated.bio || '');
            setLocation(updated.location || '');
            setBirthday(updated.birthday || '');

            onProfileUpdate?.(updated.nickname, updated.avatar_url, updated.background_url);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('保存失败，请重试');
        } finally {
            setSaving(false);
        }
    };

    const handleNicknameSave = async () => {
        if (!nickname.trim()) {
            setError('昵称不能为空');
            return;
        }
        await saveProfileData({ nickname: nickname.trim() });
        setShowNicknameEdit(false);
    };

    const handleBioSave = async () => {
        await saveProfileData({ bio: bio.trim() });
        setShowBioEdit(false);
    };

    const handleLocationSave = async (newLocation?: string) => {
        const val = newLocation !== undefined ? newLocation : location;
        await saveProfileData({ location: val.trim() });
        setShowLocationEdit(false);
    };

    const handleBirthdaySave = async (newBirthday?: string) => {
        const val = newBirthday !== undefined ? newBirthday : birthday;
        await saveProfileData({ birthday: val });
        setShowBirthdayEdit(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white shadow-sm pt-safe">
                <div className="px-4 py-4 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="flex-1 text-center text-lg font-medium text-gray-800">设置真身</h1>
                    <div className="w-6" />
                </div>
            </div>

            {/* Settings List */}
            <div className="mt-4 bg-white">
                {/* Avatar */}
                <label className="flex items-center justify-between px-6 py-4 border-b border-gray-100 active:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-gray-800">头像</span>
                    <div className="flex items-center gap-3">
                        {uploading === 'avatar' ? (
                            <Loader2 className="animate-spin text-primary-500" size={20} />
                        ) : (
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-400 ring-2 ring-yellow-300">
                                {avatarUrl ? (
                                    <img src={getImageUrl(avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User size={24} className="text-white" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'avatar')}
                        className="hidden"
                        disabled={uploading !== null}
                    />
                </label>

                {/* Background */}
                <label className="flex items-center justify-between px-6 py-4 border-b border-gray-100 active:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-gray-800">背景</span>
                    <div className="flex items-center gap-2">
                        {uploading === 'background' ? (
                            <Loader2 className="animate-spin text-primary-500" size={20} />
                        ) : (
                            backgroundUrl && (
                                <div className="w-12 h-8 rounded overflow-hidden">
                                    <img src={getImageUrl(backgroundUrl)} alt="Background" className="w-full h-full object-cover" />
                                </div>
                            )
                        )}
                        <ChevronRight size={20} className="text-gray-400" />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'background')}
                        className="hidden"
                        disabled={uploading !== null}
                    />
                </label>

                {/* Nickname */}
                {showNicknameEdit ? (
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <span className="text-gray-800 w-16">名字</span>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                maxLength={50}
                                autoFocus
                            />
                            <button
                                onClick={handleNicknameSave}
                                disabled={saving}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:bg-gray-300"
                            >
                                {saving ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowNicknameEdit(true)}
                        className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 active:bg-gray-50 transition-colors"
                    >
                        <span className="text-gray-800">名字</span>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">{nickname || '未设置'}</span>
                            <ChevronRight size={20} className="text-gray-400" />
                        </div>
                    </button>
                )}

                {/* Bio - Navigate to new page */}
                <button
                    onClick={() => navigate(`/profile/edit/bio?initial=${encodeURIComponent(bio)}`)}
                    className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 active:bg-gray-50 transition-colors"
                >
                    <span className="text-gray-800">简介</span>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600 truncate max-w-[200px]">{bio || '未设置'}</span>
                        <ChevronRight size={20} className="text-gray-400" />
                    </div>
                </button>

                {/* Location - Use RegionPicker */}
                <button
                    onClick={() => setShowLocationEdit(true)}
                    className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 active:bg-gray-50 transition-colors"
                >
                    <span className="text-gray-800">地区</span>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">{location || '未设置'}</span>
                        <ChevronRight size={20} className="text-gray-400" />
                    </div>
                </button>

                {/* Birthday - Customize Date Picker */}
                <label className="flex items-center justify-between px-6 py-4 border-b border-gray-100 active:bg-gray-50 transition-colors cursor-pointer relative">
                    <span className="text-gray-800">生日</span>
                    <div className="flex items-center gap-2">
                        <span className={`text-base ${birthday ? 'text-gray-600' : 'text-gray-400'}`}>
                            {birthday || '未设置'}
                        </span>
                        <ChevronRight size={20} className="text-gray-400" />
                    </div>
                    {/* Invisible absolute input cover to trigger native picker */}
                    <input
                        type="date"
                        value={birthday}
                        onChange={(e) => {
                            setBirthday(e.target.value);
                            handleBirthdaySave(e.target.value);
                        }}
                        className="absolute inset-0 opacity-0 z-10 w-full h-full cursor-pointer"
                    />
                </label>
            </div>

            {/* Region Picker Modal */}
            <RegionPicker
                isOpen={showLocationEdit}
                onClose={() => setShowLocationEdit(false)}
                onSelect={(loc) => {
                    setLocation(loc);
                    handleLocationSave(loc);
                }}
                currentLocation={location}
            />

            {/* Error Message */}
            {error && (
                <div className="mx-4 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Info Text */}
            <div className="px-6 py-6 text-center text-xs text-gray-400">
                点击对应项目进行修改
            </div>
        </div>
    );
};
