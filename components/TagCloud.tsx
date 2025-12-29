// TagCloud component - React Native version
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Tag } from '../services/tagService';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface TagCloudProps {
    tags: Tag[];
    activeTagId?: number;
    onTagChange: (tagId: number | undefined) => void;
}

export function TagCloud({ tags, activeTagId, onTagChange }: TagCloudProps) {
    const handleTagPress = (tagId: number | undefined) => {
        if (tagId === activeTagId) {
            onTagChange(undefined); // Deselect
        } else {
            onTagChange(tagId);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <TouchableOpacity
                    style={[
                        styles.tagButton,
                        activeTagId === undefined && styles.tagButtonActive,
                    ]}
                    onPress={() => handleTagPress(undefined)}
                >
                    <Text
                        style={[
                            styles.tagText,
                            activeTagId === undefined && styles.tagTextActive,
                        ]}
                    >
                        全部
                    </Text>
                </TouchableOpacity>

                {tags.map((tag) => (
                    <TouchableOpacity
                        key={tag.ID}
                        style={[
                            styles.tagButton,
                            activeTagId === tag.ID && styles.tagButtonActive,
                        ]}
                        onPress={() => handleTagPress(tag.ID)}
                    >
                        <Text
                            style={[
                                styles.tagText,
                                activeTagId === tag.ID && styles.tagTextActive,
                            ]}
                        >
                            {tag.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background.primary,
        paddingVertical: Spacing.sm,
    },
    scrollContent: {
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
    },
    tagButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.background.secondary,
    },
    tagButtonActive: {
        backgroundColor: Colors.primary[500],
    },
    tagText: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    tagTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
});
