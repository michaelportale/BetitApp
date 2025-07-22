import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function PublicLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to app if authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(app)');
    }
  }, [user, isLoading, router]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="dev-login" options={{ headerShown: false }} />
    </Stack>
  );
} 