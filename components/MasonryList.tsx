// MasonryList component - Waterfall layout for Xiaohongshu style
import React, { useState, useCallback, ReactNode } from 'react';
import {
    View,
    ScrollView,
    RefreshControl,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { Colors, Spacing } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');
const COLUMN_GAP = Spacing.sm;
const HORIZONTAL_PADDING = Spacing.sm;
const COLUMN_WIDTH = (screenWidth - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

interface MasonryListProps<T> {
    data: T[];
    renderItem: (item: T, index: number) => ReactNode;
    keyExtractor: (item: T, index: number) => string;
    ListHeaderComponent?: ReactNode;
    ListFooterComponent?: ReactNode;
    ListEmptyComponent?: ReactNode;
    onRefresh?: () => void;
    onEndReached?: () => void;
    refreshing?: boolean;
    isLoading?: boolean;
    onEndReachedThreshold?: number;
}

export function MasonryList<T>({
    data,
    renderItem,
    keyExtractor,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
    onRefresh,
    onEndReached,
    refreshing = false,
    isLoading = false,
    onEndReachedThreshold = 0.5,
}: MasonryListProps<T>) {
    const [leftColumnHeight, setLeftColumnHeight] = useState(0);
    const [rightColumnHeight, setRightColumnHeight] = useState(0);

    // Distribute items between two columns based on accumulated height
    const distributeItems = useCallback(() => {
        const leftColumn: { item: T; index: number }[] = [];
        const rightColumn: { item: T; index: number }[] = [];
        let leftHeight = 0;
        let rightHeight = 0;

        data.forEach((item, index) => {
            // Simple alternating distribution for now
            // In production, you'd calculate actual heights
            if (leftHeight <= rightHeight) {
                leftColumn.push({ item, index });
                leftHeight += 1;
            } else {
                rightColumn.push({ item, index });
                rightHeight += 1;
            }
        });

        return { leftColumn, rightColumn };
    }, [data]);

    const { leftColumn, rightColumn } = distributeItems();

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            const paddingToBottom = contentSize.height * onEndReachedThreshold;

            if (
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - paddingToBottom
            ) {
                onEndReached?.();
            }
        },
        [onEndReached, onEndReachedThreshold]
    );

    if (data.length === 0 && !isLoading) {
        return (
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.emptyContainer}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary[500]]}
                        />
                    ) : undefined
                }
            >
                {ListHeaderComponent}
                {ListEmptyComponent}
            </ScrollView>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={400}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary[500]]}
                    />
                ) : undefined
            }
        >
            {ListHeaderComponent}

            <View style={styles.masonryContainer}>
                {/* Left Column */}
                <View style={styles.column}>
                    {leftColumn.map(({ item, index }) => (
                        <View key={keyExtractor(item, index)} style={styles.itemWrapper}>
                            {renderItem(item, index)}
                        </View>
                    ))}
                </View>

                {/* Right Column */}
                <View style={styles.column}>
                    {rightColumn.map(({ item, index }) => (
                        <View key={keyExtractor(item, index)} style={styles.itemWrapper}>
                            {renderItem(item, index)}
                        </View>
                    ))}
                </View>
            </View>

            {isLoading && (
                <View style={styles.loadingFooter}>
                    <ActivityIndicator size="small" color={Colors.primary[500]} />
                </View>
            )}

            {ListFooterComponent}
        </ScrollView>
    );
}

export { COLUMN_WIDTH };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.secondary,
    },
    scrollContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingBottom: Spacing.xl,
    },
    emptyContainer: {
        flex: 1,
    },
    masonryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {
        width: COLUMN_WIDTH,
    },
    itemWrapper: {
        marginBottom: COLUMN_GAP,
    },
    loadingFooter: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },
});
