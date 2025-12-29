// PostCardCompact - Xiaohongshu style compact card for masonry layout
import React, { useState } from 'react';
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
import { COLUMN_WIDTH } from './MasonryList';

interface PostCardCompactProps {
    post: Post;
    onLike: (postId: string) => void;
}

// Calculate image height - use 4:3 ratio as default, or 3:4 for portrait
const getImageHeight = (post: Post): number => {
    // Alternate between different heights for visual variety
    const hashCode = parseInt(post.id, 10) || 0;
    const isPortrait = hashCode % 3 === 0;
    return isPortrait ? COLUMN_WIDTH * 1.33 : COLUMN_WIDTH * 0.75;
};

export function PostCardCompact({ post, onLike }: PostCardCompactProps) {
    const router = useRouter();
    const [imageLoaded, setImageLoaded] = useState(false);
    const imageHeight = getImageHeight(post);

    const handlePress = () => {
        router.push(`/post/${post.id}`);
    };

    const handleLike = (e: any) => {
        e.stopPropagation();
        onLike(post.id);
    };

    // Get cover image
    const coverImage = post.cover
        ? getMediaUrl(post.cover)
        : post.images && post.images.length > 0
            ? getMediaUrl(post.images[0])
            : null;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.95}
        >
            {/* Cover Image */}
            <View style={[styles.imageContainer, { height: imageHeight }]}>
                {coverImage ? (
                    <>
                        {/* Skeleton placeholder */}
                        {!imageLoaded && (
                            <View style={[styles.skeleton, { height: imageHeight }]} />
                        )}
                        <Image
                            source={{ uri: coverImage }}
                            style={[styles.coverImage, { height: imageHeight }]}
                            resizeMode="cover"
                            onLoad={() => setImageLoaded(true)}
                        />
                    </>
                ) : (
                    <View style={[styles.noImagePlaceholder, { height: imageHeight }]}>
                        <Ionicons name="document-text-outline" size={32} color={Colors.text.muted} />
                    </View>
                )}

                {/* Image count badge */}
                {post.images && post.images.length > 1 && (
                    <View style={styles.imageCountBadge}>
                        <Ionicons name="images-outline" size={12} color="#fff" />
                        <Text style={styles.imageCountText}>{post.images.length}</Text>
                    </View>
                )}

                {/* Video indicator */}
                {post.videoUrl && (
                    <View style={styles.videoIndicator}>
                        <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Title / Content - max 2 lines */}
                <Text style={styles.title} numberOfLines={2}>
                    {post.content || '无标题'}
                </Text>

                {/* Footer: Avatar + Nickname + Like */}
                <View style={styles.footer}>
                    <View style={styles.userInfo}>
                        <Image
                            source={{ uri: post.userAvatar }}
                            style={styles.avatar}
                        />
                        <Text style={styles.nickname} numberOfLines={1}>
                            {post.userNickname}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
                        <Ionicons
                            name={post.isLiked ? 'heart' : 'heart-outline'}
                            size={14}
                            color={post.isLiked ? '#FF2442' : Colors.text.muted}
                        />
                        {post.likes > 0 && (
                            <Text style={[styles.likeCount, post.isLiked && styles.likeCountActive]}>
                                {post.likes > 999 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background.card,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        width: '100%',
        backgroundColor: Colors.background.secondary,
        position: 'relative',
    },
    skeleton: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.background.secondary,
    },
    coverImage: {
        width: '100%',
    },
    noImagePlaceholder: {
        width: '100%',
        backgroundColor: Colors.background.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageCountBadge: {
        position: 'absolute',
        top: Spacing.xs,
        right: Spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    imageCountText: {
        color: '#fff',
        fontSize: 10,
        marginLeft: 2,
    },
    videoIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: Spacing.sm,
    },
    title: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: Spacing.xs,
    },
    avatar: {
        width: 18,
        height: 18,
        borderRadius: 9,
        marginRight: Spacing.xs,
    },
    nickname: {
        fontSize: 11,
        color: Colors.text.secondary,
        flex: 1,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: Spacing.xs,
    },
    likeCount: {
        fontSize: 11,
        color: Colors.text.muted,
        marginLeft: 2,
    },
    likeCountActive: {
        color: '#FF2442',
    },
});
