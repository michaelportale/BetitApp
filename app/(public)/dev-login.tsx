import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';

const DevLoginScreen = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login after a short delay
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.title}>Redirecting to Login</Text>
      <Text style={styles.subtitle}>
        Dev login has been replaced with real Supabase authentication
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DevLoginScreen;
