// PostCard component - React Native version
import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../types';
import { getMediaUrl } from '../services/api';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface PostCardProps {
    post: Post;
    onLike: (postId: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export function PostCard({ post, onLike }: PostCardProps) {
    const router = useRouter();

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 30) return `${days}天前`;
        return new Date(timestamp).toLocaleDateString('zh-CN');
    };

    const handlePress = () => {
        router.push(`/post/${post.id}`);
    };

    const handleLike = () => {
        onLike(post.id);
    };

    const renderImages = () => {
        if (!post.images || post.images.length === 0) return null;

        const imageCount = post.images.length;
        const imageWidth =
            imageCount === 1
                ? screenWidth - Spacing.md * 4
                : (screenWidth - Spacing.md * 5) / 2;

        return (
            <View style={styles.imagesContainer}>
                {post.images.slice(0, 4).map((imageUrl, index) => (
                    <Image
                        key={index}
                        source={{ uri: getMediaUrl(imageUrl) }}
                        style={[
                            styles.postImage,
                            {
                                width: imageWidth,
                                height: imageCount === 1 ? 200 : 120,
                            },
                        ]}
                        resizeMode="cover"
                    />
                ))}
                {imageCount > 4 && (
                    <View style={[styles.moreImages, { width: imageWidth, height: 120 }]}>
                        <Text style={styles.moreImagesText}>+{imageCount - 4}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            {/* Header */}
            <View style={styles.header}>
                <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
                <View style={styles.headerInfo}>
                    <Text style={styles.nickname}>{post.userNickname}</Text>
                    <Text style={styles.time}>{formatTime(post.timestamp)}</Text>
                </View>
                <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{post.tag.name}</Text>
                </View>
            </View>

            {/* Content */}
            {post.content ? (
                <Text style={styles.content} numberOfLines={5}>
                    {post.content}
                </Text>
            ) : null}

            {/* Images */}
            {renderImages()}

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                    <Ionicons
                        name={post.isLiked ? 'heart' : 'heart-outline'}
                        size={20}
                        color={post.isLiked ? Colors.error : Colors.text.secondary}
                    />
                    <Text
                        style={[
                            styles.actionText,
                            post.isLiked && { color: Colors.error },
                        ]}
                    >
                        {post.likes > 0 ? post.likes : '点赞'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
                    <Ionicons
                        name="chatbubble-outline"
                        size={18}
                        color={Colors.text.secondary}
                    />
                    <Text style={styles.actionText}>评论</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons
                        name="share-outline"
                        size={20}
                        color={Colors.text.secondary}
                    />
                    <Text style={styles.actionText}>分享</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background.card,
        marginHorizontal: Spacing.md,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: Spacing.sm,
    },
    headerInfo: {
        flex: 1,
    },
    nickname: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    time: {
        fontSize: 12,
        color: Colors.text.muted,
        marginTop: 2,
    },
    tagBadge: {
        backgroundColor: Colors.primary[50],
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    tagText: {
        fontSize: 12,
        color: Colors.primary[500],
    },
    content: {
        fontSize: 15,
        lineHeight: 22,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    postImage: {
        borderRadius: BorderRadius.md,
    },
    moreImages: {
        borderRadius: BorderRadius.md,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    moreImagesText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: Spacing.sm,
        marginTop: Spacing.xs,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
    },
    actionText: {
        marginLeft: Spacing.xs,
        fontSize: 13,
        color: Colors.text.secondary,
    },
});
