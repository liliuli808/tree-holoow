// ImageCarousel - Full-width image carousel with page indicator
import React, { useState, useRef } from 'react';
import {
    View,
    Image,
    FlatList,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Modal,
    Text,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { Colors, Spacing } from '../constants/theme';
import { getMediaUrl } from '../services/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageCarouselProps {
    images: string[];
    onImagePress?: (index: number) => void;
}

export function ImageCarousel({ images, onImagePress }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const videoRef = useRef<Video>(null);

    // Helper to check if url is a video
    const isVideo = (url: string) => {
        return url.toLowerCase().match(/\.(mp4|mov|avi|wmv|flv|webm)$/);
    };

    if (!images || images.length === 0) {
        return null;
    }

    const handleScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const offset = event.nativeEvent.contentOffset.x;
        const index = Math.round(offset / slideSize);
        if (index !== currentIndex && index >= 0 && index < images.length) {
            setCurrentIndex(index);
        }
    };

    const handleImagePress = (index: number) => {
        if (onImagePress) {
            onImagePress(index);
        } else {
            setShowFullscreen(true);
        }
    };

    const renderItem = ({ item, index }: { item: string; index: number }) => {
        const isItemVideo = isVideo(item);

        return (
            <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => handleImagePress(index)}
            >
                {isItemVideo ? (
                    <View style={styles.videoContainer}>
                        <Video
                            source={{ uri: getMediaUrl(item) }}
                            style={styles.image}
                            resizeMode={ResizeMode.COVER}
                            shouldPlay={currentIndex === index}
                            isLooping
                            isMuted={false}
                            useNativeControls={false}
                        />
                        <View style={styles.liveBadge}>
                            <Ionicons name="aperture" size={12} color="#000" />
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                    </View>
                ) : (
                    <Image
                        source={{ uri: getMediaUrl(item) }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}
            </TouchableOpacity>
        );
    };

    const renderFullscreenItem = ({ item, index }: { item: string; index: number }) => {
        const isItemVideo = isVideo(item);
        const isActive = currentIndex === index; // This might need adjustment for fullscreen index tracking

        return (
            <View style={styles.fullscreenImageContainer}>
                {isItemVideo ? (
                    <Video
                        source={{ uri: getMediaUrl(item) }}
                        style={styles.fullscreenImage}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={isActive}
                        isLooping
                        useNativeControls
                    />
                ) : (
                    <Image
                        source={{ uri: getMediaUrl(item) }}
                        style={styles.fullscreenImage}
                        resizeMode="contain"
                    />
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={images}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                bounces={false}
            />

            {/* Page Indicator */}
            {images.length > 1 && (
                <View style={styles.pageIndicator}>
                    <Text style={styles.pageText}>
                        {currentIndex + 1}/{images.length}
                    </Text>
                </View>
            )}

            {/* Fullscreen Modal */}
            <Modal
                visible={showFullscreen}
                transparent
                animationType="fade"
                onRequestClose={() => setShowFullscreen(false)}
            >
                <StatusBar backgroundColor="#000" barStyle="light-content" />
                <View style={styles.fullscreenContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowFullscreen(false)}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>

                    <FlatList
                        data={images}
                        renderItem={renderFullscreenItem}
                        keyExtractor={(_, index) => `fs-${index}`}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        initialScrollIndex={currentIndex}
                        getItemLayout={(_, index) => ({
                            length: screenWidth,
                            offset: screenWidth * index,
                            index,
                        })}
                    />

                    <View style={styles.fullscreenIndicator}>
                        <Text style={styles.fullscreenPageText}>
                            {currentIndex + 1} / {images.length}
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: screenWidth,
        height: screenWidth,
        backgroundColor: Colors.background.secondary,
    },
    image: {
        width: screenWidth,
        height: screenWidth,
    },
    pageIndicator: {
        position: 'absolute',
        bottom: Spacing.md,
        right: Spacing.md,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: 10,
    },
    pageText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImageContainer: {
        width: screenWidth,
        height: screenHeight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImage: {
        width: screenWidth,
        height: screenHeight * 0.8,
    },
    fullscreenIndicator: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    fullscreenPageText: {
        color: '#fff',
        fontSize: 14,
    },
    videoContainer: {
        position: 'relative',
    },
    liveBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    liveText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#000',
        letterSpacing: 0.5,
    },
});
