
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Users, TrendingUp, Vote, Trophy, Plus } from 'lucide-react-native';
import { betStore, type Bet, type Group } from '../../src/lib/betStore';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useAppNavigation } from './_layout';
import AppHeader from '@/components/ui/AppHeader';

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      {icon}
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const ListItem = ({ title, subtitle, onPress }: { title: string, subtitle: string, onPress: () => void }) => (
  <View style={styles.listItem}>
    <View style={styles.listItemTextContainer}>
      <Text style={styles.listItemTitle}>{title}</Text>
      <Text style={styles.listItemSubtitle}>{subtitle}</Text>
    </View>
    <TouchableOpacity style={styles.viewButton} onPress={onPress}>
      <Text style={styles.viewButtonText}>View</Text>
    </TouchableOpacity>
  </View>
);

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { openDrawer, navigateToNotifications, notificationCount } = useAppNavigation();
  
  if (authLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please sign in</Text>
      </View>
    );
  }

  const groups = betStore.getUserGroups(user.id);
  const bets = betStore.getUserBets(user.id);
  const userBalance = betStore.getUserBalance(user.id);
  const awaitingVoteCount = bets.filter((b: Bet) => b.status === 'voting').length;

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Dashboard"
        onMenuPress={openDrawer}
        onNotificationPress={navigateToNotifications}
        notificationCount={notificationCount}
      />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back, {user.displayName}!</Text>
          <Text style={styles.subtitle}>Here&apos;s what&apos;s happening with your bets</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon={<Users color="#0e7490" size={32} />} label="Groups" value={groups.length} />
          <StatCard icon={<TrendingUp color="#f59e0b" size={32} />} label="Active Bets" value={bets.length} />
          <StatCard icon={<Vote color="#8b5cf6" size={32} />} label="Awaiting Vote" value={awaitingVoteCount} />
          <StatCard icon={<Trophy color="#10b981" size={32} />} label="Net Balance" value={`$${userBalance}`} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bets</Text>
            <TouchableOpacity onPress={() => router.push('/bets')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {bets.slice(0, 3).map((bet: Bet) => (
            <ListItem
              key={bet.id}
              title={bet.title}
              subtitle={`Status: ${bet.status}`}
              onPress={() => router.push(`/bet/${bet.id}`)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Groups</Text>
            <TouchableOpacity onPress={() => router.push('/groups')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {groups.map((group: Group) => (
            <ListItem
              key={group.id}
              title={group.name}
              subtitle={`${group.memberIds.length} members`}
              onPress={() => router.push(`/group/${group.id}`)}
            />
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create-group')}
      >
        <Plus color="white" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  statCard: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    marginRight: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 14,
    color: '#8e8e93',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  viewAllText: {
    color: '#0e7490',
    fontWeight: 'bold',
  },
  listItem: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listItemTextContainer: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 4,
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3a3a3c',
    borderRadius: 8,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#0e7490',
    borderRadius: 28,
    elevation: 8,
  },
}); 