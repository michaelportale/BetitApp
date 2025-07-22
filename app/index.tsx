import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function RootIndex() {
  const router = useRouter();

  useEffect(() => {
    // Simple redirect to public routes initially
    // The app layout will handle authentication logic
    router.replace('/(public)');
  }, [router]);

  // Don't render anything, just redirect
  return null;
}