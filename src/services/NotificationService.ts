import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: 'bet_invite' | 'proof_submitted' | 'bet_resolved' | 'vote_needed';
  betId?: string;
  groupId?: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  private static pushToken: string | null = null;

  /**
   * Register for push notifications and get Expo push token
   */
  static async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    try {
      // Check if we already have permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Ask for permission if we don't have it
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permissions not granted');
        return null;
      }

      // Get the Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.pushToken = tokenData.data;
      console.log('Expo push token:', this.pushToken);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'BetIt Notifications',
          description: 'Notifications for betting activities',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      return this.pushToken;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Save push token to user profile in Supabase
   */
  static async savePushTokenToProfile(userId: string, pushToken: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          push_token: pushToken,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Failed to save push token:', error);
        return false;
      }

      console.log('Push token saved to profile successfully');
      return true;
    } catch (error) {
      console.error('Error saving push token:', error);
      return false;
    }
  }

  /**
   * Initialize notifications for the current user
   */
  static async initialize(userId: string): Promise<void> {
    try {
      const pushToken = await this.registerForPushNotifications();

      if (pushToken) {
        await this.savePushTokenToProfile(userId, pushToken);
      }

      // Set up notification response listener
      this.setupNotificationResponseListener();
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Set up listener for when user interacts with notifications
   */
  private static setupNotificationResponseListener() {
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notification response:', data);

      // Handle notification tap - navigate to relevant screen
      this.handleNotificationResponse(data);
    });
  }

  /**
   * Handle notification tap responses
   */
  private static handleNotificationResponse(data: any) {
    // This would integrate with your navigation system
    // For now, we'll just log the data
    console.log('Handling notification response:', data);

    // Example: Navigate to bet screen if betId is provided
    if (data.betId) {
      // Navigate to bet details screen
      // router.push(`/(app)/bet/${data.betId}`);
    }
  }

  /**
   * Get current push token
   */
  static getCurrentPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Clear push token from profile (e.g., on logout)
   */
  static async clearPushToken(userId: string): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({
          push_token: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      this.pushToken = null;
      console.log('Push token cleared from profile');
    } catch (error) {
      console.error('Failed to clear push token:', error);
    }
  }

  /**
   * Get user's notifications from database
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 50
  ): Promise<UserNotification[]> {
    try {
      // For development, return empty array since we don't have the notifications table yet
      if (__DEV__) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
      }

      return (data || []).map(notification => ({
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        read: notification.read,
        createdAt: new Date(notification.created_at),
      }));
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      if (__DEV__) {
        return true;
      }

      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      return !error;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      if (__DEV__) {
        return 0;
      }

      const { data, error } = await supabase
        .from('user_notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Failed to get unread count:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Schedule a local notification (for testing)
   */
  static async scheduleLocalNotification(notification: NotificationData): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: notification.data || {},
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
    }
  }
}
