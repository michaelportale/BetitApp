import React, { useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatListProps,
  ListRenderItem,
} from 'react-native';
import { colors } from '@/constants/theme';

interface PaginatedListProps<T>
  extends Omit<FlatListProps<T>, 'data' | 'onEndReached' | 'ListFooterComponent'> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalLoaded?: number;
  totalCount?: number;
  onLoadMore: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  showLoadingCount?: boolean;
}

export const PaginatedList = <T,>({
  data,
  isLoading,
  isLoadingMore,
  hasMore,
  totalLoaded,
  totalCount,
  onLoadMore,
  onRefresh,
  isRefreshing = false,
  renderItem,
  keyExtractor,
  emptyTitle = 'No items found',
  emptyMessage = 'There are no items to display at this time.',
  emptyIcon,
  showLoadingCount = true,
  ...flatListProps
}: PaginatedListProps<T>) => {
  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, isLoading, onLoadMore]);

  const LoadingFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const LoadingCountHeader = () => {
    if (!showLoadingCount || isLoading) return null;

    return (
      <View style={styles.countHeader}>
        <Text style={styles.countText}>
          {totalLoaded && totalCount
            ? `Showing ${totalLoaded} of ${totalCount} items`
            : totalLoaded
              ? `${totalLoaded} items loaded`
              : ''}
        </Text>
      </View>
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {emptyIcon && <View style={styles.emptyIcon}>{emptyIcon}</View>}
      <Text style={styles.emptyTitle}>{emptyTitle}</Text>
      <Text style={styles.emptyMessage}>{emptyMessage}</Text>
    </View>
  );

  const LoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  if (isLoading && data.length === 0) {
    return <LoadingComponent />;
  }

  return (
    <View style={styles.container}>
      <LoadingCountHeader />
      <FlatList
        {...flatListProps}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={LoadingFooter}
        ListEmptyComponent={!isLoading ? EmptyComponent : null}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={
          flatListProps.getItemLayout ||
          ((data, index) => ({
            length: 80, // Approximate item height
            offset: 80 * index,
            index,
          }))
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  countHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  countText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
