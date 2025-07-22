import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ListRenderItem,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ExternalLink,
  Receipt,
  Calendar,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { LedgerService } from '@/services/LedgerService';
import { BetService } from '@/services/BetService';
import { PaginatedList } from '@/components/ui/PaginatedList';
import NetBalance from '@/components/ui/NetBalance';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import type { LedgerEntry } from '@/lib/betStore';

interface LedgerEntryItemProps {
  entry: LedgerEntry;
  onPressBet: (betId: string) => void;
}

const LedgerEntryItem = React.memo<LedgerEntryItemProps>(({ entry, onPressBet }) => {
  const isCredit = entry.amount > 0;
  const absoluteAmount = Math.abs(entry.amount);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Query bet details to show title and participants
  const { data: bet } = useQuery({
    queryKey: ['bet', entry.betId],
    queryFn: () => BetService.getBet(entry.betId),
    enabled: !!entry.betId,
  });

  const accessibilityLabel = `${isCredit ? 'Credit' : 'Debit'} of $${absoluteAmount.toFixed(2)} on ${formatDate(entry.createdAt)}`;

  return (
    <View
      style={styles.entryItem}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.entryHeader}>
        <View style={styles.entryIcon}>
          {isCredit ? (
            <ArrowUpCircle color={colors.success} size={24} />
          ) : (
            <ArrowDownCircle color={colors.error} size={24} />
          )}
        </View>

        <View style={styles.entryDetails}>
          <View style={styles.entryMainRow}>
            <Text style={styles.entryDescription} numberOfLines={1}>
              {bet?.title || 'Bet Transaction'}
            </Text>
            <Text style={[styles.entryAmount, { color: isCredit ? colors.success : colors.error }]}>
              {isCredit ? '+' : '-'}${absoluteAmount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.entryMetaRow}>
            <View style={styles.entryDate}>
              <Calendar color={colors.textSecondary} size={14} />
              <Text style={styles.entryMeta}>
                {formatDate(entry.createdAt)} • {formatTime(entry.createdAt)}
              </Text>
            </View>

            {bet && (
              <TouchableOpacity
                style={styles.betLinkButton}
                onPress={() => onPressBet(entry.betId)}
                accessibilityRole="button"
                accessibilityLabel={`View bet details for ${bet.title}`}
              >
                <ExternalLink color={colors.primary} size={14} />
                <Text style={styles.betLinkText}>View Bet</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
});

const LedgerScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  // Fetch user balance
  const { data: balance = 0, isLoading: balanceLoading } = useQuery({
    queryKey: ['user-balance', user?.id],
    queryFn: () => (user ? LedgerService.getUserBalance(user.id) : Promise.resolve(0)),
    enabled: !!user,
  });

  // Fetch ledger entries with pagination
  const {
    data: ledgerEntries,
    isLoading: entriesLoading,
    isLoadingMore,
    hasMore,
    totalLoaded,
    totalCount,
    loadMore,
    refetch,
    isRefetching,
  } = usePaginatedQuery({
    queryKey: ['user-ledger-paginated', user?.id],
    queryFn: params =>
      user
        ? LedgerService.getUserLedgerPaginated(user.id, params)
        : Promise.resolve({ data: [], hasMore: false }),
    enabled: !!user,
    limit: 25,
    initialPageParam: 0,
  });

  const handlePressBet = React.useCallback(
    (betId: string) => {
      router.push(`/(app)/bet/${betId}`);
    },
    [router]
  );

  const renderEntry: ListRenderItem<LedgerEntry> = React.useCallback(
    ({ item }) => <LedgerEntryItem entry={item} onPressBet={handlePressBet} />,
    [handlePressBet]
  );

  const keyExtractor = React.useCallback((item: LedgerEntry) => item.id, []);

  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">
        Financial Ledger
      </Text>
      <Text style={styles.subtitle}>Track your betting wins and losses</Text>

      <View style={styles.balanceCard}>
        <NetBalance balance={balance} size="large" loading={balanceLoading} />
      </View>

      {ledgerEntries.length > 0 && (
        <View style={styles.sectionHeader}>
          <Receipt color={colors.textSecondary} size={20} />
          <Text style={styles.sectionTitle}>Transaction History</Text>
        </View>
      )}
    </View>
  );

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText} accessibilityRole="alert">
          Please log in to view your ledger
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <PaginatedList
        data={ledgerEntries}
        renderItem={renderEntry}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        isLoading={entriesLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        totalLoaded={totalLoaded}
        totalCount={totalCount}
        onLoadMore={loadMore}
        onRefresh={refetch}
        isRefreshing={isRefetching}
        emptyTitle="No Transactions Yet"
        emptyMessage="Your betting transactions will appear here once you start participating in bets."
        emptyIcon={<Receipt color={colors.textSecondary} size={64} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        accessibilityRole="list"
        accessibilityLabel="Financial transactions list"
      />
    </KeyboardAvoidingView>
  );
};

export default LedgerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: spacing[8],
  },
  header: {
    padding: spacing[6],
    paddingTop: 60,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing[1],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing[6],
  },
  balanceCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  entryItem: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    padding: spacing[4],
  },
  entryHeader: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  entryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryDetails: {
    flex: 1,
  },
  entryMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  entryDescription: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginRight: spacing[2],
  },
  entryAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  entryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  entryMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  betLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundTertiary,
  },
  betLinkText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[6],
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing[6],
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  emptyStateButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
  },
});
