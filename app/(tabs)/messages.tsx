// Messages page - Xiaohongshu style conversation list with swipe to delete
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    RefreshControl,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getConversations, Conversation } from '../../services/chatService';
import { getMediaUrl } from '../../services/api';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');
const DELETE_THRESHOLD = 80;

// Swipeable item component
function SwipeableItem({
    children,
    onDelete,
}: {
    children: React.ReactNode;
    onDelete: () => void;
}) {
    const translateX = useRef(new Animated.Value(0)).current;
    const isSwipedRef = useRef(false);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx < 0) {
                    translateX.setValue(Math.max(gestureState.dx, -DELETE_THRESHOLD - 20));
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < -DELETE_THRESHOLD) {
                    isSwipedRef.current = true;
                    Animated.spring(translateX, {
                        toValue: -DELETE_THRESHOLD,
                        useNativeDriver: true,
                    }).start();
                } else {
                    isSwipedRef.current = false;
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const handleDeletePress = () => {
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onDelete();
        });
    };

    return (
        <View style={styles.swipeableContainer}>
            {/* Delete button behind */}
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
                <Ionicons name="trash-outline" size={22} color="#fff" />
                <Text style={styles.deleteText}>删除</Text>
            </TouchableOpacity>

            {/* Main content */}
            <Animated.View
                style={[styles.swipeableContent, { transform: [{ translateX }] }]}
                {...panResponder.panHandlers}
            >
                {children}
            </Animated.View>
        </View>
    );
}

export default function MessagesScreen() {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchConversations = async (refresh = false) => {
        if (refresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            const data = await getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const handleDelete = (conversationId: number) => {
        setConversations((prev) =>
            prev.filter((c) => c.id !== conversationId)
        );
        // TODO: Call API to delete conversation
    };

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        return new Date(timestamp).toLocaleDateString('zh-CN');
    };

    const handlePress = (conversation: Conversation) => {
        router.push(`/chat/${conversation.other_user.id}`);
    };

    const renderItem = ({ item }: { item: Conversation }) => (
        <SwipeableItem onDelete={() => handleDelete(item.id)}>
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
            >
                {/* Avatar with unread badge */}
                <View style={styles.avatarContainer}>
                    <Image
                        source={{
                            uri: item.other_user.avatar_url
                                ? getMediaUrl(item.other_user.avatar_url)
                                : `https://picsum.photos/seed/${item.other_user.id}/100`,
                        }}
                        style={styles.avatar}
                    />
                    {item.unread_count > 0 && (
                        <View style={styles.unreadDot}>
                            {item.unread_count <= 9 ? (
                                <Text style={styles.unreadDotText}>{item.unread_count}</Text>
                            ) : (
                                <Text style={styles.unreadDotText}>9+</Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Conversation info */}
                <View style={styles.conversationInfo}>
                    <View style={styles.conversationHeader}>
                        <Text style={styles.nickname} numberOfLines={1}>
                            {item.other_user.nickname || `用户${item.other_user.id}`}
                        </Text>
                        <Text style={styles.time}>{formatTime(item.last_message_at)}</Text>
                    </View>
                    <Text
                        style={[
                            styles.lastMessage,
                            item.unread_count > 0 && styles.lastMessageUnread,
                        ]}
                        numberOfLines={1}
                    >
                        {item.last_message}
                    </Text>
                </View>
            </TouchableOpacity>
        </SwipeableItem>
    );

    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                    <Ionicons name="chatbubbles-outline" size={48} color={Colors.text.muted} />
                </View>
                <Text style={styles.emptyTitle}>暂无私信</Text>
                <Text style={styles.emptySubtitle}>去发现有趣的人开始聊天吧～</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => fetchConversations(true)}
                        colors={['#FF2442']}
                    />
                }
                contentContainerStyle={conversations.length === 0 ? styles.emptyList : undefined}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    swipeableContainer: {
        position: 'relative',
        backgroundColor: '#FF2442',
    },
    swipeableContent: {
        backgroundColor: Colors.background.primary,
    },
    deleteButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: DELETE_THRESHOLD,
        backgroundColor: '#FF2442',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteText: {
        color: '#fff',
        fontSize: 12,
        marginTop: 4,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background.primary,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: Spacing.md,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    unreadDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#FF2442',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.background.primary,
        paddingHorizontal: 4,
    },
    unreadDotText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    conversationInfo: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    nickname: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
        flex: 1,
        marginRight: Spacing.sm,
    },
    time: {
        fontSize: 12,
        color: Colors.text.muted,
    },
    lastMessage: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    lastMessageUnread: {
        color: Colors.text.primary,
        fontWeight: '500',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyList: {
        flex: 1,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.background.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
        marginTop: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.text.muted,
        marginTop: Spacing.xs,
    },
});
