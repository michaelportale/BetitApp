import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItem, RefreshControl } from 'react-native';
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { PaymentService, PaymentRecord } from '@/services/PaymentService';
import { Loading } from '@/components/ui/Loading';
import { colors } from '@/constants/theme';

interface PaymentHistoryProps {
  userId: string;
}

const PaymentStatusIcon = ({ status }: { status: PaymentRecord['status'] }) => {
  const iconProps = { size: 20 };

  switch (status) {
    case 'succeeded':
      return <CheckCircle {...iconProps} color={colors.success} />;
    case 'failed':
    case 'canceled':
      return <XCircle {...iconProps} color={colors.error} />;
    case 'processing':
      return <Clock {...iconProps} color={colors.warning} />;
    case 'pending':
    default:
      return <AlertCircle {...iconProps} color={colors.textSecondary} />;
  }
};

const PaymentItem = ({ payment }: { payment: PaymentRecord }) => {
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

  const getStatusText = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'succeeded':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'canceled':
        return 'Canceled';
      case 'processing':
        return 'Processing';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'succeeded':
        return colors.success;
      case 'failed':
      case 'canceled':
        return colors.error;
      case 'processing':
        return colors.warning;
      case 'pending':
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={styles.paymentItem}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <View style={styles.paymentTitleRow}>
            <DollarSign color={colors.success} size={16} />
            <Text style={styles.paymentAmount}>{PaymentService.formatAmount(payment.amount)}</Text>
          </View>
          <Text style={styles.paymentDescription}>
            {payment.description || 'Betting winnings payout'}
          </Text>
        </View>

        <View style={styles.paymentStatus}>
          <PaymentStatusIcon status={payment.status} />
          <Text style={[styles.paymentStatusText, { color: getStatusColor(payment.status) }]}>
            {getStatusText(payment.status)}
          </Text>
        </View>
      </View>

      <View style={styles.paymentFooter}>
        <Text style={styles.paymentDate}>{formatDate(payment.createdAt)}</Text>
        <Text style={styles.paymentTime}>{formatTime(payment.createdAt)}</Text>
        {payment.stripePaymentIntentId && (
          <Text style={styles.paymentId}>ID: {payment.stripePaymentIntentId.slice(-8)}</Text>
        )}
      </View>
    </View>
  );
};

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ userId }) => {
  const {
    data: payments = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['user-payments', userId],
    queryFn: () => PaymentService.getUserPayments(userId),
    enabled: !!userId,
  });

  const renderPayment: ListRenderItem<PaymentRecord> = ({ item }) => <PaymentItem payment={item} />;

  const keyExtractor = useCallback((item: PaymentRecord) => item.id, []);

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <DollarSign color={colors.textSecondary} size={64} />
      <Text style={styles.emptyTitle}>No Payment History</Text>
      <Text style={styles.emptyMessage}>
        Your payment history will appear here once you request payouts.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading message="Loading payment history..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment History</Text>
        <Text style={styles.subtitle}>Track your betting winnings payouts</Text>
      </View>

      <FlatList
        data={payments}
        renderItem={renderPayment}
        keyExtractor={keyExtractor}
        contentContainerStyle={payments.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        accessibilityLabel="Payment history list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    padding: 16,
  },
  paymentItem: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 12,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
    marginLeft: 6,
  },
  paymentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  paymentStatus: {
    alignItems: 'flex-end',
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  paymentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundTertiary,
  },
  paymentDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  paymentTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  paymentId: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
