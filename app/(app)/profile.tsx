import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { User, LogOut, Bell, Shield, ChevronRight, Receipt, CreditCard } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { LedgerService } from '@/services/LedgerService';
import NetBalance from '@/components/ui/NetBalance';
import { colors } from '@/constants/theme';

const ProfileOption = ({
  icon,
  text,
  onPress,
}: {
  icon: React.ReactNode;
  text: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <View style={styles.optionLeft}>
      {icon}
      <Text style={styles.optionText}>{text}</Text>
    </View>
    <ChevronRight color={colors.textSecondary} size={20} />
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();

  // Fetch user balance for display
  const { data: userBalance = 0, isLoading: balanceLoading } = useQuery({
    queryKey: ['user-balance', user?.id],
    queryFn: () => (user ? LedgerService.getUserBalance(user.id) : Promise.resolve(0)),
    enabled: !!user,
  });

  const handleLogout = async () => {
    await signOut();
    router.replace('/(public)');
  };

  if (!user) {
    // This should ideally not happen if the user is in the (app) stack
    return (
      <View style={styles.container}>
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <User color="white" size={40} />
        </View>
        <Text style={styles.name}>{user.displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.balanceContainer}>
          <NetBalance balance={userBalance} size="medium" loading={balanceLoading} />
        </View>
      </View>

      <View style={styles.section}>
        <ProfileOption
          icon={<Receipt color={colors.textSecondary} size={24} />}
          text="Financial Ledger"
          onPress={() => router.push('./ledger')}
        />
        <ProfileOption
          icon={<CreditCard color={colors.textSecondary} size={24} />}
          text="Payments & Payouts"
          onPress={() => router.push('./payments')}
        />
      </View>

      <View style={styles.section}>
        <ProfileOption
          icon={<User color={colors.textSecondary} size={24} />}
          text="Account"
          onPress={() => {}}
        />
        <ProfileOption
          icon={<Bell color={colors.textSecondary} size={24} />}
          text="Notifications"
          onPress={() => router.push('./notifications')}
        />
        <ProfileOption
          icon={<Shield color={colors.textSecondary} size={24} />}
          text="Privacy & Security"
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <ProfileOption
          icon={<LogOut color={colors.error} size={24} />}
          text="Logout"
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  balanceContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    alignItems: 'center',
  },
  section: {
    marginTop: 32,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionText: {
    fontSize: 18,
    color: colors.text,
  },
});
