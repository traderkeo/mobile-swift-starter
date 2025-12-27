/**
 * Profile screen with user info and subscription status
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRevenueCat } from '@/hooks/use-revenuecat';
import { SubscriptionStatus, UsageQuotaDisplay } from '@/components/payments';

// Local color constants for icons (match tailwind.config.js)
const ICON_COLORS = {
  light: { muted: '#687076' },
  dark: { muted: '#9BA1A6' },
};

const STATUS_COLORS = {
  primary: '#0a7ea4',
  danger: '#ef4444',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { refreshCustomerInfo, isReady } = useRevenueCat();

  const [refreshing, setRefreshing] = React.useState(false);

  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Icon colors
  const iconColors = ICON_COLORS[colorScheme];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCustomerInfo();
    } finally {
      setRefreshing(false);
    }
  }, [refreshCustomerInfo]);

  if (!isReady && !refreshing) {
    return (
      <View
        className={`flex-1 justify-center items-center ${isDark ? 'bg-background-dark' : 'bg-background'}`}
      >
        <ActivityIndicator size="large" color={STATUS_COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={STATUS_COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View className="items-center mb-8">
          <TouchableOpacity
            className="w-20 h-20 rounded-full justify-center items-center mb-4 bg-primary/20"
            onPress={() => router.push('/account/edit-profile')}
          >
            <Ionicons name="person" size={40} color={STATUS_COLORS.primary} />
          </TouchableOpacity>
          <ThemedText className="text-2xl font-bold mb-1">{user?.fullName || 'User'}</ThemedText>
          <ThemedText className="text-sm opacity-70">{user?.email}</ThemedText>
          <TouchableOpacity className="mt-2" onPress={() => router.push('/account/edit-profile')}>
            <ThemedText className="text-sm text-primary font-medium">Edit Profile</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Subscription Status (RevenueCat-powered) */}
        <View className="mb-4">
          <SubscriptionStatus showManageButton />
        </View>

        {/* Plan Status */}
        <View className="mb-4">
          <UsageQuotaDisplay showUpgradePrompt onUpgrade={() => router.push('/(tabs)')} />
        </View>

        {/* Quick Actions */}
        <View className="rounded-xl p-4 mb-4 border border-border dark:border-border-dark">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="flash-outline" size={20} color={STATUS_COLORS.primary} />
            <ThemedText className="text-lg font-semibold">Quick Actions</ThemedText>
          </View>

          <View className="gap-2">
            <TouchableOpacity
              className="flex-row items-center gap-3 py-3 border-b border-border/50 dark:border-border-dark/50"
              onPress={() => router.push('/account/subscription')}
            >
              <Ionicons name="star-outline" size={20} color={STATUS_COLORS.primary} />
              <ThemedText className="flex-1">Subscription</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={iconColors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-3 py-3 border-b border-border/50 dark:border-border-dark/50"
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Ionicons name="settings-outline" size={20} color={STATUS_COLORS.primary} />
              <ThemedText className="flex-1">Settings</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={iconColors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-3 py-3"
              onPress={() => router.push('/account/help')}
            >
              <Ionicons name="help-circle-outline" size={20} color={STATUS_COLORS.primary} />
              <ThemedText className="flex-1">Help & FAQ</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={iconColors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 p-4 border border-danger rounded-lg mt-2"
          onPress={signOut}
          disabled={authLoading}
        >
          {authLoading ? (
            <ActivityIndicator color={STATUS_COLORS.danger} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color={STATUS_COLORS.danger} />
              <Text className="text-base font-semibold text-danger">Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
