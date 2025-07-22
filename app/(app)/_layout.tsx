import React, { useEffect, useState, createContext, useContext } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import DrawerMenu from '@/components/ui/DrawerMenu';

// App navigation context
interface AppNavContextType {
  openDrawer: () => void;
  navigateToNotifications: () => void;
  notificationCount: number;
}

const AppNavContext = createContext<AppNavContextType | undefined>(undefined);

export const useAppNavigation = () => {
  const context = useContext(AppNavContext);
  if (!context) {
    throw new Error('useAppNavigation must be used within AppLayout');
  }
  return context;
};

const AppLayout = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [notificationCount] = useState(3); // TODO: Get from notification service

  // Redirect to public routes if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(public)');
    }
  }, [user, isLoading, router]);

  // Don't render if not authenticated or still loading
  if (isLoading || !user) {
    return null;
  }

  const handleMenuPress = () => {
    setIsDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
  };

  const handleNotificationPress = () => {
    setIsDrawerVisible(false);
    router.push('/(app)/notifications');
  };

  const contextValue: AppNavContextType = {
    openDrawer: handleMenuPress,
    navigateToNotifications: handleNotificationPress,
    notificationCount,
  };

  return (
    <SafeAreaProvider>
      <AppNavContext.Provider value={contextValue}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="groups" />
          <Stack.Screen name="bets" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="ledger" />
          <Stack.Screen name="payments" />
          <Stack.Screen name="group/[id]" />
          <Stack.Screen name="bet/[id]" />
          <Stack.Screen name="create-bet" />
          <Stack.Screen name="create-group" />
          <Stack.Screen name="join-group" />
        </Stack>
        
        {/* Hamburger Drawer Menu */}
        <DrawerMenu 
          isVisible={isDrawerVisible} 
          onClose={handleDrawerClose} 
        />
      </AppNavContext.Provider>
    </SafeAreaProvider>
  );
};

export default AppLayout;
