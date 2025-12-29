// Home page - Xiaohongshu style waterfall feed
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllPosts } from '../../services/postService';
import { getAllTags, Tag } from '../../services/tagService';
import { toggleLike } from '../../services/likeCommentService';
import { getMediaUrl } from '../../services/api';
import { Post, Category, BackendPost, PostsResponse } from '../../types';
import { Colors, Spacing } from '../../constants/theme';
import { MasonryList } from '../../components/MasonryList';
import { PostCardCompact } from '../../components/PostCardCompact';
import { TagCloud } from '../../components/TagCloud';

// Map backend tag name to frontend Category enum
const mapTagToCategory = (tagName: string): Category => {
    const tagMap: Record<string, Category> = {
        '恋爱': Category.LOVE,
        '游戏': Category.GAME,
        '音乐': Category.MUSIC,
        '电影': Category.MOVIE,
        '交友': Category.FRIENDS,
        '此刻': Category.MOMENT,
        '表白': Category.CONFESSION,
        '吐槽': Category.TRASH,
    };
    return tagMap[tagName] || Category.ALL;
};

// Transform backend post to frontend format
const transformBackendPostToFrontend = (backendPost: BackendPost): Post => {
    const isVideo = backendPost.type === 'video';
    const isAudio = backendPost.type === 'audio';
    const mediaUrls = backendPost.media_urls || [];

    const images = !isVideo && !isAudio ? mediaUrls : [];
    const videoUrl = isVideo && mediaUrls.length > 0 ? mediaUrls[0] : undefined;
    const audioUrl = isAudio && mediaUrls.length > 0 ? mediaUrls[0] : undefined;

    const tagName = backendPost.tag ? backendPost.tag.name : '未分类';

    return {
        id: backendPost.ID.toString(),
        userId: backendPost.user_id.toString(),
        userNickname:
            backendPost.user.nickname || backendPost.user.email.split('@')[0],
        userAvatar: backendPost.user.avatar_url
            ? getMediaUrl(backendPost.user.avatar_url)
            : `https://picsum.photos/seed/${backendPost.user.ID}/100`,
        category: mapTagToCategory(tagName),
        content: backendPost.text_content || '',
        images,
        videoUrl,
        audioUrl,
        cover: backendPost.cover_url,
        isLivePhoto: false,
        timestamp: new Date(backendPost.CreatedAt).getTime(),
        likes: backendPost.likes_count || 0,
        isLiked: backendPost.is_liked || false,
        comments: [],
        viewCount: 0,
        tag: {
            id: backendPost.tag ? backendPost.tag.ID.toString() : '0',
            name: tagName,
        },
        type: backendPost.type || 'text',
    };
};

export default function HomeScreen() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTagId, setActiveTagId] = useState<number | undefined>(undefined);

    // Load tags on mount
    useEffect(() => {
        const loadTags = async () => {
            try {
                const fetchedTags = await getAllTags();
                setTags(fetchedTags);
            } catch (error) {
                console.error('Failed to load tags:', error);
            }
        };
        loadTags();
    }, []);

    const fetchPosts = useCallback(
        async (pageNum: number, tagId?: number, refresh = false) => {
            if (refresh) {
                setIsRefreshing(true);
            } else if (pageNum === 1) {
                setIsLoading(true);
            }

            try {
                const response: PostsResponse = await getAllPosts(pageNum, tagId);
                const newPosts = (response.data || []).map(transformBackendPostToFrontend);

                if (pageNum === 1) {
                    setPosts(newPosts);
                } else {
                    setPosts((prev) => [...prev, ...newPosts]);
                }

                const totalLoaded =
                    pageNum === 1 ? newPosts.length : posts.length + newPosts.length;
                setHasMore(totalLoaded < response.total);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
                if (pageNum === 1) {
                    setPosts([]);
                }
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [posts.length]
    );

    // Fetch posts when tag changes
    useEffect(() => {
        fetchPosts(1, activeTagId);
        setPage(1);
    }, [activeTagId]);

    const handleRefresh = useCallback(() => {
        setPage(1);
        fetchPosts(1, activeTagId, true);
    }, [activeTagId, fetchPosts]);

    const handleLoadMore = useCallback(() => {
        if (!isLoading && !isRefreshing && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage, activeTagId);
        }
    }, [isLoading, isRefreshing, hasMore, page, activeTagId, fetchPosts]);

    const handleLike = async (postId: string) => {
        try {
            const result = await toggleLike(postId);
            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            isLiked: result.liked,
                            likes: result.count,
                        };
                    }
                    return post;
                })
            );
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const renderItem = (item: Post) => (
        <PostCardCompact post={item} onLike={handleLike} />
    );

    const renderHeader = () => (
        <TagCloud
            tags={tags}
            activeTagId={activeTagId}
            onTagChange={setActiveTagId}
        />
    );

    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>暂无内容，下拉刷新试试</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <MasonryList
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader()}
                ListEmptyComponent={renderEmpty()}
                onRefresh={handleRefresh}
                onEndReached={handleLoadMore}
                refreshing={isRefreshing}
                isLoading={isLoading && page > 1}
                onEndReachedThreshold={0.5}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.secondary,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xl * 3,
    },
    emptyText: {
        color: Colors.text.muted,
        fontSize: 14,
    },
});
