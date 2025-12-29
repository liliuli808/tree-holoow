// Chat detail page - Xiaohongshu style
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMessages, Message } from '../../services/chatService';
import { getMediaUrl } from '../../services/api';
import { websocketService } from '../../services/websocketService';
import { useAuth } from '../_layout';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

// Check if two dates are more than 5 minutes apart
const shouldShowTimeSeparator = (current: string, previous: string | null): boolean => {
    if (!previous) return true;
    const currentTime = new Date(current).getTime();
    const previousTime = new Date(previous).getTime();
    return currentTime - previousTime > 5 * 60 * 1000; // 5 minutes
};

// Format time for separator
const formatTimeSeparator = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today.getTime() - messageDate.getTime()) / 86400000);

    const timeStr = date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
    });

    if (diffDays === 0) {
        return timeStr;
    } else if (diffDays === 1) {
        return `昨天 ${timeStr}`;
    } else if (diffDays < 7) {
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return `${weekdays[date.getDay()]} ${timeStr}`;
    } else {
        return `${date.getMonth() + 1}月${date.getDate()}日 ${timeStr}`;
    }
};

export default function ChatDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [otherUser, setOtherUser] = useState<{ nickname: string; avatar_url: string } | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const userId = parseInt(id || '0', 10);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await getMessages(userId);
                const reversed = data.reverse();
                setMessages(reversed);

                // Get other user info from first message
                if (reversed.length > 0) {
                    const firstMsg = reversed[0];
                    if (firstMsg.sender_id === userId && firstMsg.sender) {
                        setOtherUser(firstMsg.sender);
                    } else if (firstMsg.receiver_id === userId && firstMsg.receiver) {
                        setOtherUser(firstMsg.receiver);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMessages();

        // Listen for new messages
        const unsubscribe = websocketService.onMessage((msg) => {
            if (msg.type === 'message' && msg.message) {
                if (
                    msg.message.sender_id === userId ||
                    msg.message.receiver_id === userId
                ) {
                    setMessages((prev) => [...prev, msg.message!]);
                }
            }
        });

        return () => {
            unsubscribe();
        };
    }, [userId]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const sent = websocketService.sendMessage(userId, inputText.trim());
        if (sent) {
            setInputText('');
        }
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isMe = item.sender_id === parseInt(user?.id || '0', 10);
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const showTimeSeparator = shouldShowTimeSeparator(
            item.created_at,
            previousMessage?.created_at || null
        );

        return (
            <View>
                {/* Time Separator */}
                {showTimeSeparator && (
                    <View style={styles.timeSeparator}>
                        <Text style={styles.timeSeparatorText}>
                            {formatTimeSeparator(item.created_at)}
                        </Text>
                    </View>
                )}

                {/* Message */}
                <View
                    style={[
                        styles.messageContainer,
                        isMe ? styles.messageRight : styles.messageLeft,
                    ]}
                >
                    {!isMe && (
                        <Image
                            source={{
                                uri: item.sender?.avatar_url
                                    ? getMediaUrl(item.sender.avatar_url)
                                    : `https://picsum.photos/seed/${item.sender_id}/100`,
                            }}
                            style={styles.avatar}
                        />
                    )}
                    <View
                        style={[
                            styles.messageBubble,
                            isMe ? styles.bubbleRight : styles.bubbleLeft,
                        ]}
                    >
                        <Text style={[styles.messageText, isMe && styles.messageTextRight]}>
                            {item.content}
                        </Text>
                    </View>
                    {isMe && (
                        <Image
                            source={{
                                uri: user?.avatarUrl
                                    ? getMediaUrl(user.avatarUrl)
                                    : `https://picsum.photos/seed/${user?.id}/100`,
                            }}
                            style={styles.avatar}
                        />
                    )}
                </View>
            </View>
        );
    };

    const otherUserName = otherUser?.nickname || `用户${userId}`;

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                {/* Custom Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={Colors.text.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {otherUserName}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-horizontal" size={22} color={Colors.text.primary} />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                    keyboardVerticalOffset={0}
                >
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.messageList}
                        onContentSizeChange={() =>
                            flatListRef.current?.scrollToEnd({ animated: true })
                        }
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Bottom Input Bar */}
                    <View style={styles.inputContainer}>
                        <TouchableOpacity style={styles.inputIcon}>
                            <Ionicons name="happy-outline" size={26} color={Colors.text.secondary} />
                        </TouchableOpacity>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="发送消息..."
                                placeholderTextColor={Colors.text.muted}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={500}
                            />
                        </View>

                        {inputText.trim() ? (
                            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                                <Text style={styles.sendButtonText}>发送</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.inputIcon}>
                                    <Ionicons name="image-outline" size={26} color={Colors.text.secondary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.inputIcon}>
                                    <Ionicons name="add-circle-outline" size={26} color={Colors.text.secondary} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.secondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.background.primary,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    moreButton: {
        padding: Spacing.xs,
    },
    keyboardView: {
        flex: 1,
    },
    messageList: {
        padding: Spacing.md,
        paddingBottom: Spacing.lg,
    },
    timeSeparator: {
        alignItems: 'center',
        marginVertical: Spacing.md,
    },
    timeSeparatorText: {
        fontSize: 12,
        color: Colors.text.muted,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: Spacing.sm,
        alignItems: 'flex-end',
    },
    messageLeft: {
        justifyContent: 'flex-start',
    },
    messageRight: {
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    messageBubble: {
        maxWidth: screenWidth * 0.65,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 18,
    },
    bubbleLeft: {
        backgroundColor: Colors.background.primary,
        marginLeft: Spacing.sm,
        borderBottomLeftRadius: 4,
    },
    bubbleRight: {
        backgroundColor: '#FF2442',
        marginRight: Spacing.sm,
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        color: Colors.text.primary,
    },
    messageTextRight: {
        color: '#fff',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: Spacing.sm,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.background.primary,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.border,
    },
    inputIcon: {
        padding: Spacing.xs,
        marginHorizontal: 2,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: Colors.background.secondary,
        borderRadius: 20,
        marginHorizontal: Spacing.xs,
    },
    input: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: 15,
        maxHeight: 100,
        color: Colors.text.primary,
    },
    sendButton: {
        backgroundColor: '#FF2442',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 16,
        marginLeft: Spacing.xs,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
