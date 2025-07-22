import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { GroupService } from '@/services/GroupService';
import { colors } from '@/constants/theme';

const CreateGroupScreen = () => {
  const [name, setName] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: (groupName: string) => {
      if (!user) throw new Error('No user logged in');
      return GroupService.createGroup(groupName, user.id);
    },
    onSuccess: newGroup => {
      // Invalidate and refetch user groups query
      queryClient.invalidateQueries({ queryKey: ['user-groups', user?.id] });
      Alert.alert('Success', `Group "${newGroup.name}" created!`);
      router.back();
    },
    onError: error => {
      console.error('Failed to create group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    },
  });

  const handleCreateGroup = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a group.');
      return;
    }

    createGroupMutation.mutate(name.trim());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Create New Group</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Group Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Office Squad"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity
          style={[styles.button, createGroupMutation.isPending && styles.buttonDisabled]}
          onPress={handleCreateGroup}
          disabled={createGroupMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateGroupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
