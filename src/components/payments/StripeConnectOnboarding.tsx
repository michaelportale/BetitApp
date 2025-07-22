import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { ExternalLink, CheckCircle, AlertCircle, Loader } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentService, StripeConnectAccount } from '@/services/PaymentService';
import { useToast } from '@/contexts/ToastContext';
import { colors } from '@/constants/theme';

interface StripeConnectOnboardingProps {
  userId: string;
  stripeAccount: StripeConnectAccount | null;
  onOnboardingComplete: () => void;
}

export const StripeConnectOnboarding: React.FC<StripeConnectOnboardingProps> = ({
  userId,
  stripeAccount,
  onOnboardingComplete,
}) => {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();

  const startOnboardingMutation = useMutation({
    mutationFn: () => PaymentService.startStripeConnectOnboarding(userId),
    onSuccess: async result => {
      if (result) {
        try {
          const supported = await Linking.canOpenURL(result.onboardingUrl);
          if (supported) {
            await Linking.openURL(result.onboardingUrl);
            showSuccess('Opening Stripe onboarding in browser');
          } else {
            showError('Cannot open Stripe onboarding URL');
          }
        } catch (error) {
          console.error('Error opening Stripe onboarding URL:', error);
          showError('Failed to open Stripe onboarding');
        }
      } else {
        showError('Failed to start Stripe onboarding');
      }
    },
    onError: error => {
      console.error('Stripe onboarding error:', error);
      showError('Failed to start Stripe onboarding');
    },
  });

  const checkOnboardingStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const isComplete = await PaymentService.completeStripeConnectOnboarding(userId);
      if (isComplete) {
        showSuccess('Stripe onboarding completed successfully!');
        queryClient.invalidateQueries({ queryKey: ['stripe-connect-status'] });
        onOnboardingComplete();
      } else {
        showError('Stripe onboarding is not yet complete');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      showError('Failed to check onboarding status');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleRestartOnboarding = () => {
    Alert.alert(
      'Restart Onboarding',
      'This will start a new Stripe onboarding process. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => startOnboardingMutation.mutate(),
          style: 'default',
        },
      ]
    );
  };

  if (stripeAccount?.onboardingComplete) {
    return (
      <View style={styles.container}>
        <View style={styles.statusContainer}>
          <CheckCircle color={colors.success} size={32} />
          <Text style={styles.statusTitle}>Payment Setup Complete</Text>
          <Text style={styles.statusMessage}>
            Your Stripe account is connected and ready to receive payouts.
          </Text>
        </View>

        <View style={styles.accountInfo}>
          <Text style={styles.accountLabel}>Account ID:</Text>
          <Text style={styles.accountValue}>{stripeAccount.id}</Text>
        </View>
      </View>
    );
  }

  if (stripeAccount && !stripeAccount.onboardingComplete) {
    return (
      <View style={styles.container}>
        <View style={styles.statusContainer}>
          <AlertCircle color={colors.warning} size={32} />
          <Text style={styles.statusTitle}>Onboarding In Progress</Text>
          <Text style={styles.statusMessage}>
            Complete your Stripe onboarding to start receiving payouts.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={checkOnboardingStatus}
          disabled={isCheckingStatus}
          accessibilityRole="button"
          accessibilityLabel="Check if Stripe onboarding is complete"
        >
          {isCheckingStatus ? (
            <Loader color={colors.white} size={20} />
          ) : (
            <CheckCircle color={colors.white} size={20} />
          )}
          <Text style={styles.buttonText}>{isCheckingStatus ? 'Checking...' : 'Check Status'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleRestartOnboarding}
          disabled={startOnboardingMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel="Restart Stripe onboarding process"
        >
          <ExternalLink color={colors.primary} size={20} />
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Restart Onboarding</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <AlertCircle color={colors.textSecondary} size={32} />
        <Text style={styles.statusTitle}>Payment Setup Required</Text>
        <Text style={styles.statusMessage}>
          Connect your Stripe account to receive payouts for your betting winnings.
        </Text>
      </View>

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Benefits:</Text>
        <Text style={styles.benefitItem}>• Secure payment processing</Text>
        <Text style={styles.benefitItem}>• Fast payouts to your bank account</Text>
        <Text style={styles.benefitItem}>• Track all your transactions</Text>
        <Text style={styles.benefitItem}>• Industry-standard security</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => startOnboardingMutation.mutate()}
        disabled={startOnboardingMutation.isPending}
        accessibilityRole="button"
        accessibilityLabel="Start Stripe Connect onboarding"
      >
        {startOnboardingMutation.isPending ? (
          <Loader color={colors.white} size={20} />
        ) : (
          <ExternalLink color={colors.white} size={20} />
        )}
        <Text style={styles.buttonText}>
          {startOnboardingMutation.isPending ? 'Starting...' : 'Setup Payments'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        You'll be redirected to Stripe to complete the secure onboarding process.
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
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 20,
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
  accountInfo: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  accountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'monospace',
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  benefitItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
});
