// Radio page - placeholder
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants/theme';

export default function RadioScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="radio" size={64} color={Colors.primary[300]} />
                </View>
                <Text style={styles.title}>电台功能</Text>
                <Text style={styles.subtitle}>敬请期待...</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.text.muted,
    },
});
