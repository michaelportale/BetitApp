import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, Users, Trophy, Vote, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationService, UserNotification } from '@/services/NotificationService';
import { Loading } from '@/components/ui/Loading';
import { colors } from '@/constants/theme';

const NotificationIcon = ({ type }: { type: string }) => {
  const iconProps = { size: 20, style: styles.notificationIcon };

  switch (type) {
    case 'bet_invite':
      return <Trophy {...iconProps} color={colors.warning} />;
    case 'proof_submitted':
      return <Vote {...iconProps} color={colors.info} />;
    case 'bet_resolved':
      return <CheckCircle {...iconProps} color={colors.success} />;
    case 'vote_needed':
      return <Vote {...iconProps} color={colors.primary} />;
    case 'group_joined':
      return <Users {...iconProps} color={colors.info} />;
    default:
      return <Bell {...iconProps} color={colors.textSecondary} />;
  }
};

const NotificationItem = ({
  notification,
  onPress,
  onMarkAsRead,
}: {
  notification: UserNotification;
  onPress: () => void;
  onMarkAsRead: (id: string) => void;
}) => (
  <TouchableOpacity
    style={[styles.notificationItem, !notification.read && styles.unreadNotification]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`${notification.title}. ${notification.message}. ${notification.read ? 'Read' : 'Unread'}`}
  >
    <View style={styles.notificationContent}>
      <View style={styles.notificationHeader}>
        <NotificationIcon type={notification.type} />
        <Text style={[styles.notificationTitle, !notification.read && styles.unreadText]}>
          {notification.title}
        </Text>
        {!notification.read && (
          <TouchableOpacity
            style={styles.markReadButton}
            onPress={() => onMarkAsRead(notification.id)}
            accessibilityRole="button"
            accessibilityLabel="Mark as read"
          >
            <CheckCircle color={colors.primary} size={16} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.notificationMessage}>{notification.message}</Text>

      <Text style={styles.notificationTime}>{formatNotificationTime(notification.createdAt)}</Text>
    </View>
  </TouchableOpacity>
);

const formatNotificationTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const NotificationsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['user-notifications', user?.id],
    queryFn: () => (user ? NotificationService.getUserNotifications(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: NotificationService.markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const handleNotificationPress = useCallback(
    (notification: UserNotification) => {
      // Mark as read if unread
      if (!notification.read) {
        markAsReadMutation.mutate(notification.id);
      }

      // Navigate based on notification data
      const data = notification.data;
      if (data.betId) {
        router.push(`/(app)/bet/${data.betId}`);
      } else if (data.groupId) {
        router.push(`/(app)/group/${data.groupId}`);
      }
    },
    [router, markAsReadMutation]
  );

  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      markAsReadMutation.mutate(notificationId);
    },
    [markAsReadMutation]
  );

  const renderNotification: ListRenderItem<UserNotification> = ({ item }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleNotificationPress(item)}
      onMarkAsRead={handleMarkAsRead}
    />
  );

  const keyExtractor = useCallback((item: UserNotification) => item.id, []);

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <BellOff color={colors.textSecondary} size={64} />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyMessage}>
        You'll see updates about bets, groups, and voting here.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading message="Loading notifications..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={keyExtractor}
        contentContainerStyle={notifications.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        accessibilityLabel="Notifications list"
      />
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  unreadNotification: {
    borderLeftColor: colors.primary,
    backgroundColor: colors.backgroundTertiary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  markReadButton: {
    padding: 4,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textSecondary,
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
