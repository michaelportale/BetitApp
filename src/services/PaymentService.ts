import { supabase } from '@/lib/supabase';
import { betStore } from '@/lib/betStore';

export interface StripeConnectAccount {
  id: string;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  stripePaymentIntentId: string | null;
  stripeTransferId: string | null;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  description: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentParams {
  userId: string;
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
}

export class PaymentService {
  private static readonly STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  private static readonly API_BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  /**
   * Get user's Stripe Connect onboarding status
   */
  static async getStripeConnectStatus(userId: string): Promise<StripeConnectAccount | null> {
    try {
      if (__DEV__) {
        // Return mock data in development
        return {
          id: 'acct_mock_' + userId.slice(0, 8),
          onboardingComplete: Math.random() > 0.5,
          chargesEnabled: true,
          payoutsEnabled: true,
        };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('stripe_account_id, stripe_onboarding_complete')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to get Stripe Connect status:', error);
        return null;
      }

      if (!data.stripe_account_id) {
        return null;
      }

      // In production, you would call your backend to get the full account status
      // For now, we'll use the onboarding_complete flag from the database
      return {
        id: data.stripe_account_id,
        onboardingComplete: data.stripe_onboarding_complete,
        chargesEnabled: data.stripe_onboarding_complete,
        payoutsEnabled: data.stripe_onboarding_complete,
      };
    } catch (error) {
      console.error('Error getting Stripe Connect status:', error);
      return null;
    }
  }

  /**
   * Start Stripe Connect onboarding for a user
   */
  static async startStripeConnectOnboarding(
    userId: string
  ): Promise<{ accountId: string; onboardingUrl: string } | null> {
    try {
      if (__DEV__) {
        // Return mock data in development
        const mockAccountId = 'acct_mock_' + userId.slice(0, 8);
        const mockOnboardingUrl = `https://connect.stripe.com/setup/e/${mockAccountId}`;

        // Update database with mock account ID
        await supabase
          .from('profiles')
          .update({
            stripe_account_id: mockAccountId,
            stripe_onboarding_complete: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        return {
          accountId: mockAccountId,
          onboardingUrl: mockOnboardingUrl,
        };
      }

      // In production, call your backend API to create Stripe Connect account
      const response = await fetch(`${this.API_BASE_URL}/api/stripe/connect/create-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Stripe Connect account');
      }

      const result = await response.json();

      // Update database with account ID
      await supabase
        .from('profiles')
        .update({
          stripe_account_id: result.accountId,
          stripe_onboarding_complete: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      return result;
    } catch (error) {
      console.error('Error starting Stripe Connect onboarding:', error);
      return null;
    }
  }

  /**
   * Complete Stripe Connect onboarding (called after user completes onboarding)
   */
  static async completeStripeConnectOnboarding(userId: string): Promise<boolean> {
    try {
      if (__DEV__) {
        // Mock completion in development
        await supabase
          .from('profiles')
          .update({
            stripe_onboarding_complete: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        return true;
      }

      // In production, verify the account status with Stripe
      const response = await fetch(`${this.API_BASE_URL}/api/stripe/connect/verify-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify Stripe Connect account');
      }

      const result = await response.json();

      if (result.onboardingComplete) {
        await supabase
          .from('profiles')
          .update({
            stripe_onboarding_complete: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }

      return result.onboardingComplete;
    } catch (error) {
      console.error('Error completing Stripe Connect onboarding:', error);
      return false;
    }
  }

  /**
   * Get user's unpaid balance (positive winnings that haven't been paid out)
   */
  static async getUserUnpaidBalance(userId: string): Promise<number> {
    try {
      if (__DEV__) {
        // Use betStore for development
        const ledgerEntries = betStore.getUserLedger(userId);
        const totalWinnings = ledgerEntries
          .filter((entry: any) => entry.amount > 0)
          .reduce((sum: number, entry: any) => sum + entry.amount, 0);

        // Mock some payments for testing
        const mockPaidAmount = Math.floor(totalWinnings * 0.3); // 30% already paid
        return Math.max(totalWinnings - mockPaidAmount, 0);
      }

      const { data, error } = await supabase.rpc('get_user_unpaid_balance', {
        user_id_param: userId,
      });

      if (error) {
        console.error('Failed to get unpaid balance:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error getting unpaid balance:', error);
      return 0;
    }
  }

  /**
   * Create a payment to settle user's positive balance
   */
  static async createPayment(
    params: CreatePaymentParams
  ): Promise<{ paymentIntentId: string; clientSecret: string } | null> {
    try {
      if (__DEV__) {
        // Mock payment creation in development
        const mockPaymentIntentId = 'pi_mock_' + Date.now();
        const mockClientSecret = mockPaymentIntentId + '_secret_mock';

        // Create payment record in database
        await supabase.rpc('create_payment', {
          user_id_param: params.userId,
          amount_param: params.amount,
          stripe_payment_intent_id_param: mockPaymentIntentId,
          description_param: params.description || 'Betting winnings payout',
          metadata_param: params.metadata || {},
        });

        return {
          paymentIntentId: mockPaymentIntentId,
          clientSecret: mockClientSecret,
        };
      }

      // In production, call your backend API to create PaymentIntent
      const response = await fetch(`${this.API_BASE_URL}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const result = await response.json();

      // Create payment record in database
      await supabase.rpc('create_payment', {
        user_id_param: params.userId,
        amount_param: params.amount,
        stripe_payment_intent_id_param: result.paymentIntentId,
        description_param: params.description || 'Betting winnings payout',
        metadata_param: params.metadata || {},
      });

      return result;
    } catch (error) {
      console.error('Error creating payment:', error);
      return null;
    }
  }

  /**
   * Get user's payment history
   */
  static async getUserPayments(userId: string): Promise<PaymentRecord[]> {
    try {
      if (__DEV__) {
        // Return mock payment history for development
        return [
          {
            id: 'pay_mock_1',
            userId,
            amount: 2500, // $25.00
            currency: 'usd',
            stripePaymentIntentId: 'pi_mock_1',
            stripeTransferId: 'tr_mock_1',
            status: 'succeeded',
            description: 'Betting winnings payout',
            metadata: {},
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'pay_mock_2',
            userId,
            amount: 1000, // $10.00
            currency: 'usd',
            stripePaymentIntentId: 'pi_mock_2',
            stripeTransferId: null,
            status: 'processing',
            description: 'Betting winnings payout',
            metadata: {},
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ];
      }

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to get user payments:', error);
        return [];
      }

      return (data || []).map(payment => ({
        id: payment.id,
        userId: payment.user_id,
        amount: payment.amount,
        currency: payment.currency,
        stripePaymentIntentId: payment.stripe_payment_intent_id,
        stripeTransferId: payment.stripe_transfer_id,
        status: payment.status,
        description: payment.description,
        metadata: payment.metadata,
        createdAt: new Date(payment.created_at),
        updatedAt: new Date(payment.updated_at),
      }));
    } catch (error) {
      console.error('Error getting user payments:', error);
      return [];
    }
  }

  /**
   * Get payment status by PaymentIntent ID
   */
  static async getPaymentStatus(paymentIntentId: string): Promise<PaymentRecord | null> {
    try {
      if (__DEV__) {
        // Return mock payment status for development
        return {
          id: 'pay_mock_' + paymentIntentId.slice(-8),
          userId: 'user_mock',
          amount: 1500,
          currency: 'usd',
          stripePaymentIntentId: paymentIntentId,
          stripeTransferId: 'tr_mock_123',
          status: 'succeeded',
          description: 'Betting winnings payout',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (error) {
        console.error('Failed to get payment status:', error);
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        amount: data.amount,
        currency: data.currency,
        stripePaymentIntentId: data.stripe_payment_intent_id,
        stripeTransferId: data.stripe_transfer_id,
        status: data.status,
        description: data.description,
        metadata: data.metadata,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      return null;
    }
  }

  /**
   * Format amount from cents to dollars for display
   */
  static formatAmount(amountInCents: number, currency: string = 'USD'): string {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  /**
   * Convert amount from dollars to cents for Stripe
   */
  static convertToCents(amountInDollars: number): number {
    return Math.round(amountInDollars * 100);
  }
}
