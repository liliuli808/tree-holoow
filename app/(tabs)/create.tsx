// Create post page
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createPost, uploadFile } from '../../services/postService';
import { getAllTags, Tag } from '../../services/tagService';
import { useAuth } from '../_layout';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

export default function CreateScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showTagPicker, setShowTagPicker] = useState(false);

    // Load tags on mount
    React.useEffect(() => {
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

    const pickImages = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('权限提示', '需要访问相册权限才能上传图片');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 9 - images.length,
        });

        if (!result.canceled) {
            const newImages = result.assets.map((asset) => asset.uri);
            setImages((prev) => [...prev, ...newImages].slice(0, 9));
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content.trim() && images.length === 0) {
            Alert.alert('提示', '请输入内容或上传图片');
            return;
        }

        if (!selectedTag) {
            Alert.alert('提示', '请选择一个标签');
            return;
        }

        if (!user) {
            Alert.alert('提示', '请先登录');
            return;
        }

        setIsLoading(true);

        try {
            // Upload images first
            let uploadedImageUrls: string[] = [];
            if (images.length > 0) {
                for (const imageUri of images) {
                    const fileName = imageUri.split('/').pop() || 'image.jpg';
                    const uploaded = await uploadFile(imageUri, fileName, 'image/jpeg');
                    if (uploaded && uploaded.length > 0) {
                        uploadedImageUrls.push(uploaded[0].src);
                    }
                }
            }

            // Create post
            await createPost({
                user_id: parseInt(user.id, 10),
                text_content: content,
                images: uploadedImageUrls,
                tag_id: selectedTag.ID,
                status: 'published',
            });

            Alert.alert('成功', '发布成功', [
                {
                    text: '确定',
                    onPress: () => router.replace('/'),
                },
            ]);
        } catch (error: any) {
            Alert.alert('错误', error.message || '发布失败');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Content input */}
                    <TextInput
                        style={styles.textInput}
                        placeholder="分享你的想法..."
                        placeholderTextColor={Colors.text.muted}
                        multiline
                        value={content}
                        onChangeText={setContent}
                        textAlignVertical="top"
                    />

                    {/* Images */}
                    <View style={styles.imagesContainer}>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri }} style={styles.image} />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeImage(index)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {images.length < 9 && (
                            <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                                <Ionicons name="add" size={32} color={Colors.text.muted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Tag selector */}
                    <TouchableOpacity
                        style={styles.tagSelector}
                        onPress={() => setShowTagPicker(!showTagPicker)}
                    >
                        <Ionicons name="pricetag-outline" size={20} color={Colors.text.secondary} />
                        <Text style={styles.tagSelectorText}>
                            {selectedTag ? selectedTag.name : '选择标签'}
                        </Text>
                        <Ionicons
                            name={showTagPicker ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={Colors.text.muted}
                        />
                    </TouchableOpacity>

                    {showTagPicker && (
                        <View style={styles.tagList}>
                            {tags.map((tag) => (
                                <TouchableOpacity
                                    key={tag.ID}
                                    style={[
                                        styles.tagItem,
                                        selectedTag?.ID === tag.ID && styles.tagItemActive,
                                    ]}
                                    onPress={() => {
                                        setSelectedTag(tag);
                                        setShowTagPicker(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.tagItemText,
                                            selectedTag?.ID === tag.ID && styles.tagItemTextActive,
                                        ]}
                                    >
                                        {tag.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>

                {/* Submit button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        <Text style={styles.submitButtonText}>
                            {isLoading ? '发布中...' : '发布'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: Spacing.md,
    },
    textInput: {
        fontSize: 16,
        lineHeight: 24,
        color: Colors.text.primary,
        minHeight: 150,
        paddingTop: Spacing.md,
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginVertical: Spacing.md,
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.md,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    tagSelectorText: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: 15,
        color: Colors.text.secondary,
    },
    tagList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        paddingBottom: Spacing.md,
    },
    tagItem: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.background.secondary,
    },
    tagItemActive: {
        backgroundColor: Colors.primary[500],
    },
    tagItemText: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    tagItemTextActive: {
        color: '#fff',
    },
    footer: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    submitButton: {
        backgroundColor: Colors.primary[500],
        borderRadius: BorderRadius.lg,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
