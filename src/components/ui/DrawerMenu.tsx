import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Home, Users, Shield, User, Receipt, Bell, LogOut, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors, typography, spacing } from '@/constants/theme';

interface DrawerMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ComponentType<{ color: string; size: number }>;
  label: string;
  route: string;
  showBadge?: boolean;
}

const menuItems: MenuItem[] = [
  { icon: Home, label: 'Dashboard', route: '/(app)/' },
  { icon: Users, label: 'Groups', route: '/(app)/groups' },
  { icon: Shield, label: 'Bets', route: '/(app)/bets' },
  { icon: Receipt, label: 'Ledger', route: '/(app)/ledger' },
  { icon: Bell, label: 'Notifications', route: '/(app)/notifications', showBadge: true },
  { icon: User, label: 'Profile', route: '/(app)/profile' },
];

const DrawerMenu: React.FC<DrawerMenuProps> = ({ isVisible, onClose }) => {
  const router = useRouter();
  const segments = useSegments();
  const { user, signOut } = useAuth();
  const slideAnim = useRef(new Animated.Value(-320)).current;

  const currentRoute = `/(app)/${segments[segments.length - 1] || ''}`;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -320,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isVisible, slideAnim]);

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.drawer, { left: slideAnim }]}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <User color={colors.primary} size={24} />
                </View>
                <View>
                  <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => {
              const isActive = currentRoute === item.route || 
                             (item.route === '/(app)/' && currentRoute === '/(app)/');
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleNavigation(item.route)}
                >
                  <item.icon 
                    color={isActive ? colors.primary : colors.textSecondary} 
                    size={22} 
                  />
                  <Text style={[
                    styles.menuItemText,
                    isActive && styles.menuItemTextActive
                  ]}>
                    {item.label}
                  </Text>
                  {item.showBadge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>3</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <LogOut color={colors.error} size={22} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 320,
    backgroundColor: colors.backgroundSecondary,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing[4],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: spacing[2],
  },
  menuContainer: {
    flex: 1,
    paddingTop: spacing[4],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginHorizontal: spacing[2],
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: colors.backgroundTertiary,
  },
  menuItemText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginLeft: spacing[3],
    flex: 1,
  },
  menuItemTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  footer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.backgroundTertiary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  signOutText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    marginLeft: spacing[3],
    fontWeight: typography.fontWeight.medium,
  },
});

export default DrawerMenu;