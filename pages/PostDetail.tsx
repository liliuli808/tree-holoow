import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Send } from 'lucide-react';
import { Post } from '../types';
import { toggleLike, getLikeStatus, getComments, createComment, Comment } from '../services/likeCommentService';
import { ChatButton } from '../components/ChatButton';

interface PostDetailProps {
    posts: Post[];
}

export const PostDetail: React.FC<PostDetailProps> = ({ posts }) => {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post | null>(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (postId) {
            // Find post from props
            const foundPost = posts.find(p => p.id === postId);
            if (foundPost) {
                setPost(foundPost);
                loadLikeStatus();
                loadComments();
            }
        }
    }, [postId, posts]);

    const loadLikeStatus = async () => {
        if (!postId) return;
        try {
            const status = await getLikeStatus(postId);
            setLiked(status.liked);
            setLikeCount(status.count);
        } catch (error) {
            console.error('Failed to load like status:', error);
        }
    };

    const loadComments = async () => {
        if (!postId) return;
        try {
            const response = await getComments(postId);
            setComments(response.data);
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    };

    const handleLike = async () => {
        if (!postId) return;
        try {
            const result = await toggleLike(postId);
            setLiked(result.liked);
            setLikeCount(result.count);
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postId || !commentText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await createComment(postId, commentText);
            setCommentText('');
            loadComments(); // Reload comments
        } catch (error) {
            console.error('Failed to create comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!post) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="text-gray-400">帖子未找到</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-gray-600">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">帖子详情</h1>
            </div>

            {/* Post Content */}
            <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                    <img src={post.userAvatar} alt={post.userNickname} className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                        <div className="font-semibold text-gray-900">{post.userNickname}</div>
                        <div className="text-xs text-gray-400">
                            {new Date(post.timestamp).toLocaleString('zh-CN')}
                        </div>
                    </div>
                    <ChatButton userId={parseInt(post.userId)} userName={post.userNickname} variant="full" />
                </div>

                {/* Post text */}
                <div className="text-gray-800 text-base leading-relaxed mb-4 whitespace-pre-wrap">
                    {post.content}
                </div>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {post.images.map((img, idx) => (
                            <img key={idx} src={img} alt="" className="w-full aspect-square object-cover rounded-2xl" />
                        ))}
                    </div>
                )}

                {/* Video */}
                {post.videoUrl && (
                    <video src={post.videoUrl} controls className="w-full rounded-2xl mb-4" />
                )}

                {/* Audio */}
                {post.audioUrl && (
                    <audio src={post.audioUrl} controls className="w-full mb-4" />
                )}

                {/* Like and Comment Counts */}
                <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={handleLike}
                        className="flex items-center gap-2 text-sm transition-colors"
                    >
                        <Heart
                            size={20}
                            className={liked ? 'fill-red-400 text-red-400' : 'text-gray-400'}
                        />
                        <span className={liked ? 'text-red-400' : 'text-gray-600'}>{likeCount}</span>
                    </button>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MessageCircle size={20} className="text-gray-400" />
                        <span>{comments.length}</span>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="px-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4">评论 ({comments.length})</h3>

                {/* Comment List */}
                <div className="space-y-4 mb-6">
                    {comments.map((comment) => (
                        <div key={comment.ID} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-medium">
                                {comment.user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="bg-gray-50 rounded-2xl px-4 py-3">
                                    <div className="text-sm font-medium text-gray-900 mb-1">
                                        {comment.user.email.split('@')[0]}
                                    </div>
                                    <div className="text-sm text-gray-700">{comment.content}</div>
                                </div>
                                <div className="text-xs text-gray-400 mt-1 px-4">
                                    {new Date(comment.CreatedAt).toLocaleString('zh-CN')}
                                </div>
                            </div>
                        </div>
                    ))}

                    {comments.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            还没有评论，来发表第一条吧
                        </div>
                    )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleSubmitComment} className="sticky bottom-20 bg-white py-4 border-t border-gray-100">
                    <div className="flex gap-3 items-end">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="说点什么..."
                            className="flex-1 rounded-full bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-gray-100 transition-colors"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim() || isSubmitting}
                            className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
