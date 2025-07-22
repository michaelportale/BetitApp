import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// Optimized query invalidation patterns
export const useOptimizedQuery = () => {
  const queryClient = useQueryClient();

  // Invalidate user-specific queries when user changes
  const invalidateUserQueries = useCallback(
    (userId: string) => {
      queryClient.invalidateQueries({
        predicate: query => {
          const queryKey = query.queryKey;
          return (
            queryKey.includes(userId) ||
            queryKey.some(
              key => typeof key === 'string' && (key.includes('user-') || key.includes(userId))
            )
          );
        },
      });
    },
    [queryClient]
  );

  // Invalidate bet-related queries when a bet is updated
  const invalidateBetQueries = useCallback(
    (betId: string, groupId?: string) => {
      // Invalidate specific bet
      queryClient.invalidateQueries({ queryKey: ['bet', betId] });

      // Invalidate user bets lists
      queryClient.invalidateQueries({
        predicate: query => {
          const queryKey = query.queryKey;
          return queryKey.includes('user-bets') || queryKey.includes('user-bets-paginated');
        },
      });

      // Invalidate group bets if groupId provided
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: ['group-bets', groupId] });
        queryClient.invalidateQueries({ queryKey: ['group-bets-paginated', groupId] });
      }
    },
    [queryClient]
  );

  // Invalidate ledger queries when balance changes
  const invalidateLedgerQueries = useCallback(
    (userId: string) => {
      queryClient.invalidateQueries({ queryKey: ['user-balance', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-ledger', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-ledger-paginated', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-unpaid-balance', userId] });
    },
    [queryClient]
  );

  // Invalidate payment queries when payment status changes
  const invalidatePaymentQueries = useCallback(
    (userId: string) => {
      queryClient.invalidateQueries({ queryKey: ['user-payments', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-unpaid-balance', userId] });
      queryClient.invalidateQueries({ queryKey: ['stripe-connect-status', userId] });
    },
    [queryClient]
  );

  // Invalidate notification queries
  const invalidateNotificationQueries = useCallback(
    (userId: string) => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications', userId] });
    },
    [queryClient]
  );

  // Optimized cache updates for frequently changing data
  const updateQueryData = useCallback(
    <T>(queryKey: (string | number)[], updater: (oldData: T | undefined) => T | undefined) => {
      queryClient.setQueryData(queryKey, updater);
    },
    [queryClient]
  );

  // Prefetch related data
  const prefetchRelatedData = useCallback(
    async (userId: string) => {
      // Prefetch commonly accessed data
      const prefetchPromises = [
        queryClient.prefetchQuery({
          queryKey: ['user-balance', userId],
          staleTime: 5 * 60 * 1000, // 5 minutes
        }),
        queryClient.prefetchQuery({
          queryKey: ['user-groups', userId],
          staleTime: 10 * 60 * 1000, // 10 minutes
        }),
        queryClient.prefetchQuery({
          queryKey: ['unread-notifications', userId],
          staleTime: 30 * 1000, // 30 seconds
        }),
      ];

      await Promise.allSettled(prefetchPromises);
    },
    [queryClient]
  );

  // Remove stale data from cache
  const cleanupStaleData = useCallback(() => {
    queryClient.removeQueries({
      predicate: query => {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        return query.state.dataUpdatedAt < now - maxAge;
      },
    });
  }, [queryClient]);

  return {
    invalidateUserQueries,
    invalidateBetQueries,
    invalidateLedgerQueries,
    invalidatePaymentQueries,
    invalidateNotificationQueries,
    updateQueryData,
    prefetchRelatedData,
    cleanupStaleData,
  };
};

// Optimized query key factory
export const queryKeys = {
  user: (userId: string) => ['user', userId] as const,
  userBets: (userId: string) => ['user-bets', userId] as const,
  userBetsPaginated: (userId: string) => ['user-bets-paginated', userId] as const,
  userBalance: (userId: string) => ['user-balance', userId] as const,
  userLedger: (userId: string) => ['user-ledger', userId] as const,
  userLedgerPaginated: (userId: string) => ['user-ledger-paginated', userId] as const,
  userGroups: (userId: string) => ['user-groups', userId] as const,
  userPayments: (userId: string) => ['user-payments', userId] as const,
  userNotifications: (userId: string) => ['user-notifications', userId] as const,
  unreadNotifications: (userId: string) => ['unread-notifications', userId] as const,
  stripeConnectStatus: (userId: string) => ['stripe-connect-status', userId] as const,
  bet: (betId: string) => ['bet', betId] as const,
  group: (groupId: string) => ['group', groupId] as const,
  groupBets: (groupId: string) => ['group-bets', groupId] as const,
  groupBetsPaginated: (groupId: string) => ['group-bets-paginated', groupId] as const,
  groupMembers: (groupId: string) => ['group-members', groupId] as const,
} as const;
