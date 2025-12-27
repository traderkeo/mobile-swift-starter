/**
 * PremiumGate Component
 * Wrapper that shows paywall for non-premium users or children for premium users
 *
 * Usage:
 * <PremiumGate>
 *   <PremiumFeatureComponent />
 * </PremiumGate>
 *
 * Or with custom fallback:
 * <PremiumGate fallback={<UpgradePrompt />}>
 *   <PremiumFeatureComponent />
 * </PremiumGate>
 */

import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRevenueCat } from '@/hooks/use-revenuecat';

interface PremiumGateProps {
  /** Content to show when user has premium */
  children: React.ReactNode;
  /** Custom fallback when user doesn't have premium (defaults to upgrade prompt) */
  fallback?: React.ReactNode;
  /** Route to navigate for upgrade (defaults to paywall modal) */
  upgradeRoute?: string;
  /** Show inline upgrade prompt vs full fallback */
  inline?: boolean;
  /** Custom message for the upgrade prompt */
  message?: string;
}

/**
 * Default upgrade prompt shown when user doesn't have premium
 */
function DefaultUpgradePrompt({
  onUpgrade,
  message,
  inline,
}: {
  onUpgrade: () => void;
  message?: string;
  inline?: boolean;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (inline) {
    return (
      <TouchableOpacity
        onPress={onUpgrade}
        className={`flex-row items-center gap-3 p-4 rounded-xl border ${
          isDark
            ? 'border-secondary-700 bg-background-dark-secondary'
            : 'border-secondary-200 bg-secondary-50'
        }`}
      >
        <View className="w-10 h-10 rounded-full bg-primary/20 justify-center items-center">
          <Ionicons name="lock-closed" size={20} color="#0a7ea4" />
        </View>
        <View className="flex-1">
          <ThemedText className="font-semibold">Premium Feature</ThemedText>
          <ThemedText className="text-sm opacity-70">
            {message || 'Upgrade to access this feature'}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={`flex-1 justify-center items-center p-8 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
    >
      <View className="w-20 h-20 rounded-full bg-primary/20 justify-center items-center mb-6">
        <Ionicons name="lock-closed" size={40} color="#0a7ea4" />
      </View>
      <ThemedText className="text-2xl font-bold mb-2 text-center">Premium Feature</ThemedText>
      <ThemedText className="text-base opacity-70 text-center mb-6 px-4">
        {message ||
          'This feature is available for premium subscribers. Upgrade to unlock full access.'}
      </ThemedText>
      <TouchableOpacity
        onPress={onUpgrade}
        className="py-4 px-8 rounded-xl bg-primary flex-row items-center gap-2"
      >
        <Ionicons name="star" size={20} color="white" />
        <Text className="text-white text-base font-semibold">Upgrade to Premium</Text>
      </TouchableOpacity>
    </View>
  );
}

export function PremiumGate({
  children,
  fallback,
  upgradeRoute,
  inline = false,
  message,
}: PremiumGateProps) {
  const router = useRouter();
  const { isReady, isPremium } = useRevenueCat();

  const handleUpgrade = () => {
    if (upgradeRoute) {
      router.push(upgradeRoute as any);
    } else {
      // Default: navigate to products/paywall screen
      router.push('/(tabs)');
    }
  };

  // Show loading state while RevenueCat initializes
  if (!isReady) {
    if (inline) {
      return (
        <View className="p-4 items-center">
          <ActivityIndicator size="small" color="#0a7ea4" />
        </View>
      );
    }
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  // User has premium - show children
  if (isPremium) {
    return <>{children}</>;
  }

  // User doesn't have premium - show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  return <DefaultUpgradePrompt onUpgrade={handleUpgrade} message={message} inline={inline} />;
}

/**
 * Hook version for more control
 * Returns premium status and upgrade handler
 */
export function usePremiumGate() {
  const router = useRouter();
  const { isReady, isPremium } = useRevenueCat();

  const showPaywall = () => {
    router.push('/(tabs)');
  };

  return {
    isReady,
    isPremium,
    showPaywall,
  };
}
