import { supabase } from '@/lib/supabase';
import { betStore, type User } from '@/lib/betStore';

// Convert Supabase profile to app User format
const convertSupabaseProfile = (supabaseProfile: any): User => ({
  id: supabaseProfile.id,
  email: supabaseProfile.email,
  displayName: supabaseProfile.display_name || supabaseProfile.email.split('@')[0],
  avatarUrl: supabaseProfile.avatar_url,
});

export class UserService {
  // Read operations
  static async getUser(id: string): Promise<User | undefined> {
    try {
      // Try Supabase first if not in development mode
      if (!__DEV__) {
        const { data: session } = await supabase.auth.getSession();

        if (session?.session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

          if (!error && profile) {
            return convertSupabaseProfile(profile);
          }
        }
      }

      // Fallback to betStore in development or if Supabase fails
      return betStore.getUser(id);
    } catch (error) {
      console.error('Error fetching user:', error);
      // Fallback to betStore
      return betStore.getUser(id);
    }
  }

  static async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Try Supabase first if not in development mode
      if (!__DEV__) {
        const { data: session } = await supabase.auth.getSession();

        if (session?.session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

          if (!error && profile) {
            return convertSupabaseProfile(profile);
          }
        }
      }

      // Fallback to betStore in development or if Supabase fails
      return betStore.getUserByEmail(email);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      // Fallback to betStore
      return betStore.getUserByEmail(email);
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      // Try Supabase first if not in development mode
      if (!__DEV__) {
        const { data: session } = await supabase.auth.getSession();

        if (session?.session) {
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('display_name');

          if (!error && profiles) {
            return profiles.map(convertSupabaseProfile);
          }
        }
      }

      // Fallback to betStore in development or if Supabase fails
      return betStore.getAllUsers();
    } catch (error) {
      console.error('Error fetching all users:', error);
      // Fallback to betStore
      return betStore.getAllUsers();
    }
  }

  // Write operations
  static async addUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      // Try Supabase first if not in development mode
      if (!__DEV__) {
        const { data: session } = await supabase.auth.getSession();

        if (session?.session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .insert({
              id: session.session.user.id,
              email: user.email,
              display_name: user.displayName,
              avatar_url: user.avatarUrl,
            })
            .select()
            .single();

          if (!error && profile) {
            return convertSupabaseProfile(profile);
          }

          throw new Error(error?.message || 'Failed to create user profile');
        }
      }

      // Fallback to betStore in development or if Supabase fails
      return betStore.addUser(user);
    } catch (error) {
      console.error('Error creating user:', error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Failed to create user profile');
    }
  }

  static async updateUser(
    id: string,
    updates: Partial<Omit<User, 'id' | 'createdAt'>>
  ): Promise<User> {
    try {
      // Try Supabase first if not in development mode
      if (!__DEV__) {
        const { data: session } = await supabase.auth.getSession();

        if (session?.session && session.session.user.id === id) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .update({
              display_name: updates.displayName,
              avatar_url: updates.avatarUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

          if (!error && profile) {
            return convertSupabaseProfile(profile);
          }

          throw new Error(error?.message || 'Failed to update user profile');
        }
      }

      // Fallback to betStore in development or if Supabase fails
      // Note: betStore doesn't have updateUser method, so we'll throw an error
      throw new Error('User updates not supported in development mode');
    } catch (error) {
      console.error('Error updating user:', error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Failed to update user profile');
    }
  }
}
