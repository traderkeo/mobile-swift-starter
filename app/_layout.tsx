/**
 * Root layout with deep linking configuration and authentication
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/hooks/use-onboarding';
import { initializeRevenueCat } from '@/hooks/use-revenuecat';
import { checkEnv, logConfiguredServices } from '@/config/env';

// Initialize Sentry for crash reporting
import { initializeSentry, setUser as setSentryUser } from '@/lib/sentry';

// Performance monitoring
import { PerformanceMonitor } from '@/lib/performance-monitor';

// i18n
import { I18nProvider, initializeI18n } from '@/lib/i18n';

// Background tasks
import { initializeBackgroundTasks } from '@/lib/background-tasks';

// Spotlight indexing
import { indexAppScreens } from '@/lib/spotlight';

// Mark app start time for performance tracking
PerformanceMonitor.markAppStart();

// Initialize Sentry early
initializeSentry();

// Validate environment variables on startup
checkEnv();
logConfiguredServices();

// Initialize RevenueCat for payments
initializeRevenueCat();

// Initialize i18n
initializeI18n();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { hasSeenOnboarding, isLoading: onboardingLoading } = useOnboarding();

  // Initialize background tasks and index app screens
  useEffect(() => {
    if (Platform.OS !== 'web') {
      initializeBackgroundTasks();
      indexAppScreens();
    }
  }, []);

  // Set Sentry user context when authenticated
  useEffect(() => {
    if (user) {
      setSentryUser({
        id: user.id,
        email: user.email,
      });
    } else {
      setSentryUser(null);
    }
  }, [user]);

  // Handle auth and onboarding state changes for navigation
  useEffect(() => {
    if (isLoading || onboardingLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    // Not authenticated - must login first
    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // Authenticated - check onboarding
    if (!hasSeenOnboarding && !inOnboarding) {
      // Show onboarding after login
      router.replace('/onboarding');
      return;
    }

    // Skip other logic if in onboarding
    if (inOnboarding) return;

    // Authenticated and has seen onboarding - go to main app
    if (inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, hasSeenOnboarding, onboardingLoading, segments, router]);

  /**
   * Handles deep link URLs and routes to appropriate screens
   */
  const handleDeepLink = useCallback(
    async (url: string) => {
      try {
        const parsed = Linking.parse(url);
        const { path, queryParams } = parsed;

        // Handle payment callback URL (unified result screen)
        if (path?.includes('payment/result')) {
          router.push({
            pathname: '/payment/result',
            params: queryParams ?? {},
          });
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    },
    [router]
  );

  // Deep linking handler for payment callbacks
  useEffect(() => {
    // Handle initial URL if app was opened via deep link
    const handleInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink(url);
      }
    };

    handleInitialURL();

    // Listen for deep link events when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="payment/result"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  // Font loading is optional - you can add fonts later if needed
  const [loaded] = useFonts({});

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Mark app as ready for performance tracking
      PerformanceMonitor.markAppReady();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <I18nProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </I18nProvider>
  );
}
