import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Users } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { GroupService } from '@/services/GroupService';
import { LoadingOverlay } from '@/components/ui/Loading';
import { colors } from '@/constants/theme';

const JoinGroupScreen = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const joinGroupMutation = useMutation({
    mutationFn: (code: string) => {
      if (!user) throw new Error('No user logged in');
      return GroupService.joinGroup(code, user.id);
    },
    onSuccess: group => {
      if (group) {
        // Invalidate user groups to refetch the updated list
        queryClient.invalidateQueries({ queryKey: ['user-groups', user?.id] });

        showSuccess(`Successfully joined "${group.name}"!`);

        // Navigate to the group after a short delay
        setTimeout(() => {
          router.replace(`/(app)/group/${group.id}`);
        }, 1500);
      } else {
        setError('Invalid invite code or you are already a member of this group.');
      }
    },
    onError: (error: Error) => {
      console.error('Failed to join group:', error);
      const errorMessage =
        error?.message || 'Failed to join group. Please check the invite code and try again.';
      setError(errorMessage);
      showError(errorMessage);
    },
  });

  const validateInviteCode = (code: string): boolean => {
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setError('Please enter an invite code');
      return false;
    }

    if (trimmedCode.length < 6) {
      setError('Invite code must be at least 6 characters');
      return false;
    }

    // Basic format validation - alphanumeric
    if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
      setError('Invite code can only contain letters and numbers');
      return false;
    }

    return true;
  };

  const handleJoinGroup = () => {
    const trimmedCode = inviteCode.trim().toUpperCase();

    if (!validateInviteCode(trimmedCode)) return;

    if (!user) {
      showError('You must be logged in to join a group.');
      return;
    }

    setError('');
    joinGroupMutation.mutate(trimmedCode);
  };

  const handleCodeChange = (text: string) => {
    // Convert to uppercase and remove spaces for better UX
    const formattedText = text.toUpperCase().replace(/\s/g, '');
    setInviteCode(formattedText);

    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              disabled={joinGroupMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="Go back to groups"
            >
              <ArrowLeft color={colors.text} size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} accessibilityRole="header">
              Join Group
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer} accessibilityElementsHidden={true}>
              <Users color={colors.primary} size={48} />
            </View>

            <Text style={styles.title} accessibilityRole="header">
              Join a Group
            </Text>
            <Text style={styles.subtitle}>
              Enter the invite code shared by your friend to join their betting group
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Invite Code</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Enter invite code (e.g., ABC123)"
                placeholderTextColor={colors.textSecondary}
                value={inviteCode}
                onChangeText={handleCodeChange}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
                editable={!joinGroupMutation.isPending}
                accessibilityLabel="Invite code input"
                accessibilityHint="Enter the group invite code to join"
                returnKeyType="join"
                onSubmitEditing={handleJoinGroup}
              />

              {error ? (
                <Text
                  style={styles.errorText}
                  accessibilityRole="alert"
                  accessibilityLabel={`Error: ${error}`}
                >
                  {error}
                </Text>
              ) : (
                <Text style={styles.helperText} accessibilityHint="Helper text about invite codes">
                  Invite codes are case-insensitive and usually 6-8 characters long
                </Text>
              )}

              <TouchableOpacity
                style={[
                  styles.joinButton,
                  (!inviteCode.trim() || joinGroupMutation.isPending) && styles.joinButtonDisabled,
                ]}
                onPress={handleJoinGroup}
                disabled={!inviteCode.trim() || joinGroupMutation.isPending}
                accessibilityRole="button"
                accessibilityLabel={
                  joinGroupMutation.isPending ? 'Joining group, please wait' : 'Join group'
                }
                accessibilityState={{
                  disabled: !inviteCode.trim() || joinGroupMutation.isPending,
                  busy: joinGroupMutation.isPending,
                }}
              >
                <Text style={styles.joinButtonText}>
                  {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an invite code? </Text>
              <TouchableOpacity
                onPress={() => router.push('/(app)/create-group')}
                disabled={joinGroupMutation.isPending}
                accessibilityRole="button"
                accessibilityLabel="Create your own group"
              >
                <Text style={styles.footerLink}>Create your own group</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      <LoadingOverlay visible={joinGroupMutation.isPending} message="Joining group..." />
    </KeyboardAvoidingView>
  );
};

export default JoinGroupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  form: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  joinButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
