import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { updateProfile, getProfile } from '../services/userService';

// Helper to get query params
const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

export const ProfileBio: React.FC = () => {
    const navigate = useNavigate();
    const query = useQuery();
    const initialBio = query.get('initial') || '';

    const [bio, setBio] = useState(initialBio);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(!initialBio); // Load if not provided in query

    useEffect(() => {
        if (!initialBio) {
            loadBio();
        }
    }, []);

    const loadBio = async () => {
        try {
            setLoading(true);
            const data = await getProfile();
            setBio(data.bio || '');
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateProfile({ bio: bio.trim() });
            navigate(-1);
        } catch (error) {
            console.error('Failed to save bio:', error);
            // Optionally show error toast
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white shadow-sm px-4 py-4 pt-safe flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-medium text-gray-800">编辑简介</h1>
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${saving
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                        }`}
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : '完成'}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
                {loading ? (
                    <div className="flex justify-center pt-20">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-4 relative">
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="介绍一下自己吧 (支持换行)"
                            className="w-full h-48 resize-none outline-none text-gray-800 text-base leading-relaxed placeholder:text-gray-400"
                            maxLength={255}
                            autoFocus
                        />
                        <div className="absolute bottom-3 right-4 text-xs text-gray-400 font-medium">
                            {bio.length}/255
                        </div>
                    </div>
                )}
                <p className="mt-4 text-xs text-center text-gray-400 px-4">
                    好的简介能让大家更容易记住你
                </p>
            </div>
        </div>
    );
};
