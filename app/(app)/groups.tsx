import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Plus, UserPlus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useAppNavigation } from './_layout';
import { GroupService } from '@/services/GroupService';
import { Loading } from '@/components/ui/Loading';
import AppHeader from '@/components/ui/AppHeader';
import { colors } from '@/constants/theme';
import type { Group } from '@/lib/betStore';

const GroupsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { showError } = useToast();
  const { openDrawer, navigateToNotifications, notificationCount } = useAppNavigation();

  // Fetch user groups
  const {
    data: groups = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user-groups', user?.id],
    queryFn: () => (user ? GroupService.getUserGroups(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      showError('Failed to load groups. Please try again.');
    }
  }, [error, showError]);

  const renderGroupItem: ListRenderItem<Group> = ({ item: group }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => router.push(`/(app)/group/${group.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Open group ${group.name} with ${group.memberIds.length} members`}
    >
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{group.name}</Text>
        <Text
          style={styles.listItemSubtitle}
          accessibilityLabel={`${group.memberIds.length} ${group.memberIds.length === 1 ? 'member' : 'members'}`}
        >
          {group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <ChevronRight color={colors.textSecondary} size={20} />
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          My Groups
        </Text>
        <Text style={styles.subtitle}>Manage your betting groups</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(app)/create-group')}
          accessibilityRole="button"
          accessibilityLabel="Create new group"
        >
          <Plus color={colors.white} size={24} />
          <Text style={styles.actionButtonText}>Create Group</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => router.push('./join-group')}
          accessibilityRole="button"
          accessibilityLabel="Join existing group"
        >
          <UserPlus color={colors.primary} size={24} />
          <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
            Join Group
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle} accessibilityRole="text">
        No groups yet
      </Text>
      <Text style={styles.emptyStateText}>
        Create your first group or join an existing one to start betting with friends!
      </Text>
    </View>
  );

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText} accessibilityRole="alert">
          Please log in to view groups
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading message="Loading groups..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Groups"
        onMenuPress={openDrawer}
        onNotificationPress={navigateToNotifications}
        notificationCount={notificationCount}
      />
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          data={groups}
          renderItem={renderGroupItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          accessibilityRole="list"
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default GroupsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: colors.primary,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  listItem: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
