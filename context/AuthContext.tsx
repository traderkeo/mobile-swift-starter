/**
 * Authentication Context
 *
 * Provides local authentication using AsyncStorage.
 * Syncs user ID with RevenueCat for purchase management.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Alert, AppState, type AppStateStatus } from 'react-native';
import { localAuth, LocalSession } from '@/lib/auth';
import { StoredUser } from '@/lib/storage';
import { shouldRefreshSession } from '@/lib/security';
import { syncRevenueCatUser, logOutRevenueCat } from '@/hooks/use-revenuecat';

/**
 * User type for the auth context
 */
export interface User extends StoredUser {}

/**
 * Session type for the auth context
 */
export interface Session extends LocalSession {}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AppleCredential {
  user: string;
  email: string | null;
  fullName: { givenName: string | null; familyName: string | null } | null;
}

interface AuthContextType extends AuthState {
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithApple: (credential: AppleCredential) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { fullName?: string; avatarUrl?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Track app state for session refresh
  const appState = useRef(AppState.currentState);

  // Session refresh on app resume
  const refreshSessionIfNeeded = useCallback(async () => {
    try {
      const session = await localAuth.getSession();
      if (!session) return;

      // Check if session should be refreshed (7 days before expiry)
      if (shouldRefreshSession(session.expiresAt)) {
        const newSession = await localAuth.refreshSession();
        if (newSession) {
          setState((prev) => ({ ...prev, session: newSession }));
          console.log('Session refreshed successfully');
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }, []);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await localAuth.getSession();
        const user = await localAuth.getUser();

        setState({
          user: user ?? null,
          session: session ?? null,
          isLoading: false,
          isAuthenticated: !!session && !!user,
        });

        // Sync with RevenueCat if user is logged in
        if (user) {
          await syncRevenueCatUser(user.id);
        }

        // Check if session needs refresh on initial load
        if (session) {
          await refreshSessionIfNeeded();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initAuth();
  }, [refreshSessionIfNeeded]);

  // Refresh session when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        if (state.isAuthenticated) {
          refreshSessionIfNeeded();
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [state.isAuthenticated, refreshSessionIfNeeded]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { user, session } = await localAuth.signIn(email, password);

      setState({
        user,
        session,
        isLoading: false,
        isAuthenticated: true,
      });

      // Sync with RevenueCat
      await syncRevenueCatUser(user.id);
    } catch (error: unknown) {
      setState((prev) => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Failed to sign in';
      Alert.alert('Sign In Error', message);
      throw error;
    }
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, fullName?: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const { user, session } = await localAuth.signUp(email, password, fullName);

        setState({
          user,
          session,
          isLoading: false,
          isAuthenticated: true,
        });

        // Sync with RevenueCat
        await syncRevenueCatUser(user.id);

        Alert.alert('Welcome!', 'Your account has been created successfully.');
      } catch (error: unknown) {
        setState((prev) => ({ ...prev, isLoading: false }));
        const message = error instanceof Error ? error.message : 'Failed to sign up';
        Alert.alert('Sign Up Error', message);
        throw error;
      }
    },
    []
  );

  const signInWithApple = useCallback(async (credential: AppleCredential) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { user, session } = await localAuth.signInWithApple(credential);

      setState({
        user,
        session,
        isLoading: false,
        isAuthenticated: true,
      });

      // Sync with RevenueCat
      await syncRevenueCatUser(user.id);
    } catch (error: unknown) {
      setState((prev) => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Failed to sign in with Apple';
      Alert.alert('Apple Sign In Error', message);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await localAuth.signOut();
      await logOutRevenueCat();

      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error: unknown) {
      setState((prev) => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      Alert.alert('Sign Out Error', message);
      throw error;
    }
  }, []);

  const updateProfile = useCallback(
    async (data: { fullName?: string; avatarUrl?: string }) => {
      if (!state.user) {
        throw new Error('No user logged in');
      }

      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const updatedUser = await localAuth.updateProfile(data);

        setState((prev) => ({
          ...prev,
          user: updatedUser,
          isLoading: false,
        }));

        Alert.alert('Success', 'Profile updated successfully');
      } catch (error: unknown) {
        setState((prev) => ({ ...prev, isLoading: false }));
        const message = error instanceof Error ? error.message : 'Failed to update profile';
        Alert.alert('Update Error', message);
        throw error;
      }
    },
    [state.user]
  );

  const deleteAccount = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await localAuth.deleteAccount();
      await logOutRevenueCat();

      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });

      Alert.alert('Account Deleted', 'Your account and all local data have been removed.');
    } catch (error: unknown) {
      setState((prev) => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Failed to delete account';
      Alert.alert('Delete Error', message);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signInWithApple,
    signOut,
    updateProfile,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
