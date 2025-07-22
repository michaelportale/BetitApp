import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { betStore, type User } from '@/lib/betStore';

// Auth context type definitions
interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  
  // Storage key for persisting auth state
  const AUTH_STORAGE_KEY = 'auth_user';

  // Load user from storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Verify user still exists in betStore
          const existingUser = betStore.getUser(parsedUser.id);
          if (existingUser) {
            setUser(existingUser);
          } else {
            // User no longer exists, clear storage
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Mock authentication - find user by email
      const users = betStore.getAllUsers();
      const foundUser = users.find(u => u.email === email.trim().toLowerCase());
      
      if (foundUser) {
        setUser(foundUser);
        // Persist user to storage
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
        return { success: true };
      }
      
      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Check if user already exists
      const existingUser = betStore.getUserByEmail(email.trim().toLowerCase());
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }
      
      // Create and store new user in betStore
      const newUser = betStore.addUser({
        email: email.trim().toLowerCase(),
        displayName: displayName.trim(),
      });
      
      setUser(newUser);
      // Persist user to storage
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setUser(null);
      // Clear user from storage
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    signIn,
    signUp,
    signOut,
    isLoading,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export types for use in other components
export type { AuthContextType };
