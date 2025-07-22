import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentService } from '@/services/PaymentService';
import { StripeConnectOnboarding } from '@/components/payments/StripeConnectOnboarding';
import { PaymentSettle } from '@/components/payments/PaymentSettle';
import { PaymentHistory } from '@/components/payments/PaymentHistory';
import { Loading } from '@/components/ui/Loading';
import { colors } from '@/constants/theme';

const PaymentsScreen = () => {
  const { user } = useAuth();

  // Get Stripe Connect status
  const {
    data: stripeAccount,
    isLoading: isLoadingStripeStatus,
    refetch: refetchStripeStatus,
  } = useQuery({
    queryKey: ['stripe-connect-status', user?.id],
    queryFn: () => (user ? PaymentService.getStripeConnectStatus(user.id) : Promise.resolve(null)),
    enabled: !!user,
  });

  // Get unpaid balance
  const {
    data: unpaidBalance = 0,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['user-unpaid-balance', user?.id],
    queryFn: () => (user ? PaymentService.getUserUnpaidBalance(user.id) : Promise.resolve(0)),
    enabled: !!user,
  });

  const handleOnboardingComplete = () => {
    refetchStripeStatus();
  };

  const handlePaymentComplete = () => {
    refetchBalance();
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Loading message="Loading user data..." />
      </View>
    );
  }

  if (isLoadingStripeStatus || isLoadingBalance) {
    return (
      <View style={styles.container}>
        <Loading message="Loading payment information..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stripe Connect Onboarding */}
        <StripeConnectOnboarding
          userId={user.id}
          stripeAccount={stripeAccount || null}
          onOnboardingComplete={handleOnboardingComplete}
        />

        {/* Payment Settlement (only show if onboarding is complete) */}
        {stripeAccount?.onboardingComplete && (
          <PaymentSettle
            userId={user.id}
            unpaidBalance={unpaidBalance}
            onPaymentComplete={handlePaymentComplete}
          />
        )}
      </ScrollView>

      {/* Payment History (only show if onboarding is complete) */}
      {stripeAccount?.onboardingComplete && (
        <View style={styles.historyContainer}>
          <PaymentHistory userId={user.id} />
        </View>
      )}
    </View>
  );
};

export default PaymentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  historyContainer: {
    flex: 1,
    minHeight: 300,
  },
});
