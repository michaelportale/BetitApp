
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { betStore, type Bet } from '../../../src/lib/betStore';
import { ArrowLeft, Plus } from 'lucide-react-native';

function GroupDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const group = betStore.getGroup(id as string);
  const bets = group ? betStore.getGroupBets(group.id) : [];

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Group not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>{group.name}</Text>
        <TouchableOpacity 
          onPress={() => router.push(`/create-bet?groupId=${group.id}`)} 
          style={styles.createBetButton}
        >
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members</Text>
        <View style={styles.membersContainer}>
          {group.memberIds.map(memberId => {
            const member = betStore.getUser(memberId);
            return (
              <View key={memberId} style={styles.memberChip}>
                <Text style={styles.memberText}>{member?.displayName}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bets</Text>
        {bets.map((bet: Bet) => (
          <TouchableOpacity 
            key={bet.id} 
            style={styles.betCard}
            onPress={() => router.push(`/bet/${bet.id}`)}
          >
            <Text style={styles.betTitle}>{bet.title}</Text>
            <Text style={styles.betSubtitle}>{bet.sideA} vs. {bet.sideB}</Text>
            <View style={styles.betMeta}>
              <Text style={styles.betMetaText}>Stake: ${bet.stake}</Text>
              <Text style={styles.betMetaText}>Status: {bet.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  createBetButton: {
    padding: 8,
    backgroundColor: '#0e7490',
    borderRadius: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberChip: {
    backgroundColor: '#3a3a3c',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  memberText: {
    color: 'white',
    fontSize: 14,
  },
  betCard: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  betTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  betSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 4,
  },
  betMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopColor: '#3a3a3c',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  betMetaText: {
    color: '#8e8e93',
    fontSize: 12,
  },
});

export default GroupDetailsScreen;