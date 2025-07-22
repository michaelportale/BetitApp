import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Trophy } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { BetService } from '@/services/BetService';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { PaginatedList } from '@/components/ui/PaginatedList';
import { colors } from '@/constants/theme';
import type { Bet } from '@/lib/betStore';

const BetItem = React.memo<{ bet: Bet; onPress: () => void }>(({ bet, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'voting':
        return colors.info;
      case 'draft':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={styles.listItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View bet: ${bet.title}`}
    >
      <View style={styles.betContent}>
        <Text style={styles.listItemTitle}>{bet.title}</Text>
        <Text style={styles.listItemDescription} numberOfLines={2}>
          {bet.description}
        </Text>
        <View style={styles.betMeta}>
          <Text style={[styles.statusText, { color: getStatusColor(bet.status) }]}>
            {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
          </Text>
          <Text style={styles.dateText}>{formatDate(bet.eventDate)}</Text>
        </View>
      </View>
      <ChevronRight color={colors.textSecondary} size={20} />
    </TouchableOpacity>
  );
});

const BetsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data: bets,
    isLoading,
    isLoadingMore,
    hasMore,
    totalLoaded,
    totalCount,
    loadMore,
    refetch,
    isRefetching,
  } = usePaginatedQuery({
    queryKey: ['user-bets-paginated', user?.id],
    queryFn: params =>
      user
        ? BetService.getUserBetsPaginated(user.id, params)
        : Promise.resolve({ data: [], hasMore: false }),
    enabled: !!user,
    limit: 20,
    initialPageParam: 0,
  });

  const renderBet: ListRenderItem<Bet> = useCallback(
    ({ item }) => <BetItem bet={item} onPress={() => router.push(`/(app)/bet/${item.id}`)} />,
    [router]
  );

  const keyExtractor = useCallback((item: Bet) => item.id, []);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to view your bets</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bets</Text>
        <Text style={styles.subtitle}>Track all your betting activity</Text>
      </View>

      <PaginatedList
        data={bets}
        renderItem={renderBet}
        keyExtractor={keyExtractor}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        totalLoaded={totalLoaded}
        totalCount={totalCount}
        onLoadMore={loadMore}
        onRefresh={refetch}
        isRefreshing={isRefetching}
        emptyTitle="No Bets Found"
        emptyMessage="You haven't created or joined any bets yet. Join a group to start betting!"
        emptyIcon={<Trophy color={colors.textSecondary} size={64} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default BetsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    backgroundColor: colors.backgroundSecondary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContent: {
    padding: 16,
  },
  listItem: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  betContent: {
    flex: 1,
    marginRight: 12,
  },
  listItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  listItemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  betMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 60,
  },
});
