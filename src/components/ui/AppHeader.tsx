import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Bell } from 'lucide-react-native';
import { colors, typography, spacing } from '@/constants/theme';

interface AppHeaderProps {
  title: string;
  onMenuPress: () => void;
  showNotifications?: boolean;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  onMenuPress,
  showNotifications = true,
  onNotificationPress,
  notificationCount = 0,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        {/* Left side - Menu button */}
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <Menu color={colors.text} size={24} />
        </TouchableOpacity>

        {/* Center - Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Right side - Notifications */}
        <View style={styles.rightSection}>
          {showNotifications && (
            <TouchableOpacity 
              onPress={onNotificationPress} 
              style={styles.notificationButton}
            >
              <Bell color={colors.textSecondary} size={22} />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    height: 56,
  },
  menuButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: spacing[2],
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 12,
  },
});

export default AppHeader;