import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import {
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader,
} from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentService } from '@/services/PaymentService';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/constants/theme';

interface PaymentSettleProps {
  userId: string;
  unpaidBalance: number;
  onPaymentComplete: () => void;
}

export const PaymentSettle: React.FC<PaymentSettleProps> = ({
  userId,
  unpaidBalance,
  onPaymentComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();

  const createPaymentMutation = useMutation({
    mutationFn: () =>
      PaymentService.createPayment({
        userId,
        amount: unpaidBalance,
        description: 'Betting winnings payout',
        metadata: {
          type: 'winnings_payout',
          userId,
        },
      }),
    onSuccess: async result => {
      if (result) {
        setIsProcessing(true);

        // In a real app, you would integrate with Stripe's payment sheet here
        // For development, we'll simulate payment processing
        if (__DEV__) {
          setTimeout(() => {
            setIsProcessing(false);
            showSuccess('Payment processed successfully!');
            queryClient.invalidateQueries({ queryKey: ['user-unpaid-balance'] });
            queryClient.invalidateQueries({ queryKey: ['user-payments'] });
            onPaymentComplete();
          }, 2000);
        } else {
          // In production, handle the PaymentIntent with Stripe
          showSuccess('Payment initiated successfully');
          setIsProcessing(false);
        }
      } else {
        showError('Failed to create payment');
      }
    },
    onError: error => {
      console.error('Payment creation error:', error);
      showError('Failed to create payment');
    },
  });

  const handleRequestPayout = () => {
    if (unpaidBalance <= 0) {
      showError('No balance available for payout');
      return;
    }

    Alert.alert(
      'Request Payout',
      `Request payout of ${PaymentService.formatAmount(unpaidBalance)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Payout',
          onPress: () => createPaymentMutation.mutate(),
          style: 'default',
        },
      ]
    );
  };

  const formattedBalance = PaymentService.formatAmount(unpaidBalance);

  if (unpaidBalance <= 0) {
    return (
      <View style={styles.container}>
        <View style={styles.statusContainer}>
          <CheckCircle color={colors.textSecondary} size={32} />
          <Text style={styles.statusTitle}>No Pending Payouts</Text>
          <Text style={styles.statusMessage}>
            You don't have any winnings available for payout at this time.
          </Text>
        </View>
      </View>
    );
  }

  if (isProcessing) {
    return (
      <View style={styles.container}>
        <View style={styles.statusContainer}>
          <Loader color={colors.primary} size={32} />
          <Text style={styles.statusTitle}>Processing Payment</Text>
          <Text style={styles.statusMessage}>
            Your payout of {formattedBalance} is being processed...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <DollarSign color={colors.success} size={24} />
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Available for Payout</Text>
          <Text style={styles.balanceAmount}>{formattedBalance}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <CreditCard color={colors.textSecondary} size={20} />
          <Text style={styles.infoText}>Paid directly to your bank account</Text>
        </View>
        <View style={styles.infoItem}>
          <Clock color={colors.textSecondary} size={20} />
          <Text style={styles.infoText}>Processing takes 1-3 business days</Text>
        </View>
        <View style={styles.infoItem}>
          <AlertTriangle color={colors.warning} size={20} />
          <Text style={styles.infoText}>Stripe fees may apply (2.9% + 30¢)</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.payoutButton,
          createPaymentMutation.isPending && styles.payoutButtonDisabled,
        ]}
        onPress={handleRequestPayout}
        disabled={createPaymentMutation.isPending}
        accessibilityRole="button"
        accessibilityLabel={`Request payout of ${formattedBalance}`}
      >
        {createPaymentMutation.isPending ? (
          <Loader color={colors.white} size={20} />
        ) : (
          <DollarSign color={colors.white} size={20} />
        )}
        <Text style={styles.payoutButtonText}>
          {createPaymentMutation.isPending ? 'Creating...' : 'Request Payout'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Funds will be transferred to your connected Stripe account and then to your bank account.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 20,
    margin: 16,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  balanceInfo: {
    marginLeft: 12,
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.success,
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  payoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  payoutButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  payoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
