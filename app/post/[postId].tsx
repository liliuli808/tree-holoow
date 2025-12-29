// Post detail page - Xiaohongshu style
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
    getComments,
    createComment,
    Comment,
    toggleLike,
    getLikeStatus,
} from '../../services/likeCommentService';
import { getPostById } from '../../services/postService';
import { getMediaUrl } from '../../services/api';
import { useAuth } from '../_layout';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { ImageCarousel } from '../../components/ImageCarousel';
import { Post, BackendPost } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

export default function PostDetailScreen() {
    const { postId } = useLocalSearchParams<{ postId: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const scrollViewRef = useRef<ScrollView>(null);

    const [post, setPost] = useState<BackendPost | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [likeInfo, setLikeInfo] = useState({ liked: false, count: 0 });
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postData, commentsData, likeData] = await Promise.all([
                    getPostById(postId || ''),
                    getComments(postId || ''),
                    getLikeStatus(postId || ''),
                ]);
                setPost(postData);
                setComments(commentsData.data || []);
                setLikeInfo(likeData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (postId) {
            fetchData();
        }
    }, [postId]);

    const handleLike = async () => {
        try {
            const result = await toggleLike(postId || '');
            setLikeInfo(result);
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
    };

    const handleSubmitComment = async () => {
        if (!inputText.trim()) return;

        setIsSubmitting(true);
        try {
            const newComment = await createComment(postId || '', inputText.trim());
            setComments((prev) => [newComment, ...prev]);
            setInputText('');
        } catch (error: any) {
            Alert.alert('错误', error.message || '评论发送失败');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 30) return `${days}天前`;
        return date.toLocaleDateString('zh-CN');
    };

    const handleUserPress = () => {
        // Navigate to user profile
        if (post?.user_id) {
            router.push(`/profile/${post.user_id}`);
        }
    };

    const handleChat = () => {
        if (post?.user_id) {
            router.push(`/chat/${post.user_id}`);
        }
    };

    if (isLoading || !post) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.loadingText}>加载中...</Text>
            </SafeAreaView>
        );
    }

    const userAvatar = post.user?.avatar_url
        ? getMediaUrl(post.user.avatar_url)
        : `https://picsum.photos/seed/${post.user_id}/100`;
    const userNickname = post.user?.nickname || post.user?.email?.split('@')[0] || '匿名用户';

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                {/* Fixed Header - Author Info */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.authorInfo} onPress={handleUserPress}>
                        <Image source={{ uri: userAvatar }} style={styles.authorAvatar} />
                        <Text style={styles.authorName} numberOfLines={1}>{userNickname}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.followButton, isFollowing && styles.followingButton]}
                        onPress={handleFollow}
                    >
                        <Text style={[styles.followText, isFollowing && styles.followingText]}>
                            {isFollowing ? '已关注' : '关注'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="share-outline" size={22} color={Colors.text.primary} />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                    keyboardVerticalOffset={0}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Image Carousel */}
                        {post.media_urls && post.media_urls.length > 0 && (
                            <ImageCarousel images={post.media_urls} />
                        )}

                        {/* Content Section */}
                        <View style={styles.contentSection}>
                            {/* Title */}
                            <Text style={styles.title}>{post.text_content}</Text>

                            {/* Tags */}
                            {post.tag && (
                                <View style={styles.tagsContainer}>
                                    <View style={styles.tag}>
                                        <Text style={styles.tagText}>#{post.tag.name}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Post Time */}
                            <Text style={styles.postTime}>
                                {formatTime(post.CreatedAt)}
                            </Text>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Comments Section */}
                            <View style={styles.commentsSection}>
                                <Text style={styles.commentsTitle}>
                                    共 {comments.length} 条评论
                                </Text>

                                {comments.length === 0 ? (
                                    <View style={styles.emptyComments}>
                                        <Text style={styles.emptyText}>还没有评论，快来抢沙发~</Text>
                                    </View>
                                ) : (
                                    comments.map((comment) => (
                                        <View key={comment.ID} style={styles.commentItem}>
                                            <Image
                                                source={{
                                                    uri: `https://picsum.photos/seed/${comment.user_id}/100`,
                                                }}
                                                style={styles.commentAvatar}
                                            />
                                            <View style={styles.commentContent}>
                                                <View style={styles.commentHeader}>
                                                    <Text style={styles.commentNickname}>
                                                        {comment.user?.email?.split('@')[0] || `用户${comment.user_id}`}
                                                    </Text>
                                                    <Text style={styles.commentTime}>
                                                        {formatTime(comment.CreatedAt)}
                                                    </Text>
                                                </View>
                                                <Text style={styles.commentText}>{comment.content}</Text>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Fixed Bottom Bar */}
                    <View style={styles.bottomBar}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="说点什么..."
                                placeholderTextColor={Colors.text.muted}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={200}
                            />
                            {inputText.trim() && (
                                <TouchableOpacity
                                    style={styles.sendButton}
                                    onPress={handleSubmitComment}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.sendText}>
                                        {isSubmitting ? '...' : '发送'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.actionBar}>
                            <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
                                <Ionicons
                                    name={likeInfo.liked ? 'heart' : 'heart-outline'}
                                    size={24}
                                    color={likeInfo.liked ? '#FF2442' : Colors.text.secondary}
                                />
                                <Text style={[styles.actionCount, likeInfo.liked && styles.actionCountActive]}>
                                    {likeInfo.count || '赞'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionItem}>
                                <Ionicons name="star-outline" size={24} color={Colors.text.secondary} />
                                <Text style={styles.actionCount}>收藏</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionItem}>
                                <Ionicons name="chatbubble-outline" size={22} color={Colors.text.secondary} />
                                <Text style={styles.actionCount}>{comments.length || '评论'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
                                <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                                <Text style={styles.chatButtonText}>私聊</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background.primary,
    },
    loadingText: {
        color: Colors.text.muted,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background.primary,
    },
    backButton: {
        padding: Spacing.xs,
        marginRight: Spacing.sm,
    },
    authorInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: Spacing.sm,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
        flex: 1,
    },
    followButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        backgroundColor: '#FF2442',
        borderRadius: BorderRadius.full,
        marginRight: Spacing.sm,
    },
    followingButton: {
        backgroundColor: Colors.background.secondary,
    },
    followText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    followingText: {
        color: Colors.text.secondary,
    },
    moreButton: {
        padding: Spacing.xs,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    contentSection: {
        padding: Spacing.md,
    },
    title: {
        fontSize: 16,
        lineHeight: 24,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: Spacing.sm,
    },
    tag: {
        backgroundColor: 'rgba(255,36,66,0.1)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        marginRight: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    tagText: {
        fontSize: 12,
        color: '#FF2442',
    },
    postTime: {
        fontSize: 12,
        color: Colors.text.muted,
        marginBottom: Spacing.md,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.md,
    },
    commentsSection: {
        paddingBottom: Spacing.xl,
    },
    commentsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    emptyComments: {
        paddingVertical: Spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.text.muted,
        fontSize: 14,
    },
    commentItem: {
        flexDirection: 'row',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: Spacing.sm,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    commentNickname: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    commentTime: {
        fontSize: 11,
        color: Colors.text.muted,
    },
    commentText: {
        fontSize: 14,
        lineHeight: 20,
        color: Colors.text.primary,
    },
    bottomBar: {
        backgroundColor: Colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        paddingBottom: Spacing.md,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.secondary,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 14,
        paddingVertical: Spacing.sm,
        maxHeight: 80,
        color: Colors.text.primary,
    },
    sendButton: {
        paddingLeft: Spacing.sm,
    },
    sendText: {
        color: '#FF2442',
        fontWeight: '600',
        fontSize: 14,
    },
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    actionCount: {
        fontSize: 12,
        color: Colors.text.secondary,
        marginLeft: Spacing.xs,
    },
    actionCountActive: {
        color: '#FF2442',
    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF2442',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
    chatButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: Spacing.xs,
    },
});
