// Profile page - user profile
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../_layout';
import { getProfile, UserProfile } from '../../services/userService';
import { getMediaUrl } from '../../services/api';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                setProfile(data);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        Alert.alert('退出登录', '确定要退出登录吗？', [
            { text: '取消', style: 'cancel' },
            {
                text: '退出',
                style: 'destructive',
                onPress: signOut,
            },
        ]);
    };

    const menuItems = [
        { icon: 'heart-outline', label: '我的收藏', onPress: () => { } },
        { icon: 'time-outline', label: '浏览历史', onPress: () => { } },
        { icon: 'settings-outline', label: '设置', onPress: () => { } },
        { icon: 'help-circle-outline', label: '帮助与反馈', onPress: () => { } },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.backgroundImage}>
                        {profile?.background_url ? (
                            <Image
                                source={{ uri: getMediaUrl(profile.background_url) }}
                                style={styles.backgroundImageContent}
                            />
                        ) : (
                            <View style={styles.backgroundPlaceholder} />
                        )}
                    </View>

                    <View style={styles.profileInfo}>
                        <Image
                            source={{
                                uri: profile?.avatar_url
                                    ? getMediaUrl(profile.avatar_url)
                                    : user?.avatarUrl,
                            }}
                            style={styles.avatar}
                        />
                        <Text style={styles.nickname}>
                            {profile?.nickname || user?.nickname || '用户'}
                        </Text>
                        {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{profile?.follow_count || 0}</Text>
                                <Text style={styles.statLabel}>关注</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{profile?.fan_count || 0}</Text>
                                <Text style={styles.statLabel}>粉丝</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{profile?.liked_count || 0}</Text>
                                <Text style={styles.statLabel}>获赞</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => router.push('/profile/edit')}
                        >
                            <Text style={styles.editButtonText}>编辑资料</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Menu */}
                <View style={styles.menu}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={22}
                                color={Colors.text.secondary}
                            />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors.text.muted}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>退出登录</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.secondary,
    },
    header: {
        backgroundColor: Colors.background.primary,
        marginBottom: Spacing.md,
    },
    backgroundImage: {
        height: 120,
    },
    backgroundImageContent: {
        width: '100%',
        height: '100%',
    },
    backgroundPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.primary[100],
    },
    profileInfo: {
        alignItems: 'center',
        paddingBottom: Spacing.lg,
        marginTop: -40,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: Colors.background.primary,
        marginBottom: Spacing.sm,
    },
    nickname: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    bio: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.text.muted,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: Colors.border,
    },
    editButton: {
        borderWidth: 1,
        borderColor: Colors.primary[500],
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    editButtonText: {
        color: Colors.primary[500],
        fontSize: 14,
        fontWeight: '600',
    },
    menu: {
        backgroundColor: Colors.background.primary,
        marginBottom: Spacing.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: Colors.text.primary,
        marginLeft: Spacing.md,
    },
    logoutButton: {
        backgroundColor: Colors.background.primary,
        alignItems: 'center',
        paddingVertical: Spacing.md,
        marginBottom: Spacing.xl,
    },
    logoutText: {
        fontSize: 16,
        color: Colors.error,
    },
});
