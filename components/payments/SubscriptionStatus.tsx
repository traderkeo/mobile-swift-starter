/**
 * SubscriptionStatus Component
 * Displays current subscription status with management options
 *
 * Usage:
 * <SubscriptionStatus />
 *
 * Or with custom styling:
 * <SubscriptionStatus compact showManageButton={false} />
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Text,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRevenueCat } from '@/hooks/use-revenuecat';
import { getManagementURL } from '@/services/payments';
import { LEGAL_URLS } from '@/config/product';

// Local color constants for icons (match tailwind.config.js)
const ICON_COLORS = {
  light: { text: '#11181C', muted: '#687076', subtle: '#9BA1A6' },
  dark: { text: '#ECEDEE', muted: '#9BA1A6', subtle: '#687076' },
};

const STATUS_COLORS = {
  primary: '#0a7ea4',
  success: '#22c55e',
  warning: '#f59e0b',
  secondary400: '#9ca3af',
};

interface SubscriptionStatusProps {
  /** Compact display mode */
  compact?: boolean;
  /** Show manage subscription button */
  showManageButton?: boolean;
  /** Custom class name */
  className?: string;
}

export function SubscriptionStatus({
  compact = false,
  showManageButton = true,
  className = '',
}: SubscriptionStatusProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const { isReady, isPremium, customerInfo, refreshCustomerInfo } = useRevenueCat();
  const [refreshing, setRefreshing] = React.useState(false);

  // Icon colors
  const iconColors = ICON_COLORS[colorScheme];

  const handleManageSubscription = async () => {
    try {
      // Try to get RevenueCat management URL first
      const managementURL = await getManagementURL();
      if (managementURL) {
        await Linking.openURL(managementURL);
        return;
      }

      // Fallback to platform-specific URLs
      const fallbackURL = Platform.select({
        ios: LEGAL_URLS.manageSubscriptions,
        android: 'https://play.google.com/store/account/subscriptions',
        default: null,
      });

      if (fallbackURL) {
        await Linking.openURL(fallbackURL);
      } else {
        Alert.alert(
          'Manage Subscription',
          'Please manage your subscription through your app store settings.'
        );
      }
    } catch {
      Alert.alert('Error', 'Could not open subscription management.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshCustomerInfo();
    } finally {
      setRefreshing(false);
    }
  };

  if (!isReady) {
    return (
      <View className={`p-4 items-center ${className}`}>
        <ActivityIndicator size="small" color={STATUS_COLORS.primary} />
      </View>
    );
  }

  // Get active entitlement expiration
  const premiumEntitlement = customerInfo?.entitlements.active['premium'];
  const expirationDate = premiumEntitlement?.expirationDate
    ? new Date(premiumEntitlement.expirationDate)
    : null;
  const willRenew = premiumEntitlement?.willRenew ?? false;

  if (compact) {
    return (
      <TouchableOpacity
        onPress={showManageButton ? handleManageSubscription : undefined}
        className={`flex-row items-center gap-3 p-3 rounded-xl border ${
          isDark
            ? 'border-secondary-700 bg-background-dark-secondary'
            : 'border-secondary-200 bg-background'
        } ${className}`}
      >
        <View
          className={`w-10 h-10 rounded-full justify-center items-center ${
            isPremium ? 'bg-success/20' : 'bg-secondary-200'
          }`}
        >
          <Ionicons
            name={isPremium ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={isPremium ? STATUS_COLORS.success : STATUS_COLORS.secondary400}
          />
        </View>
        <View className="flex-1">
          <ThemedText className="font-semibold">
            {isPremium ? 'Premium Active' : 'Free Plan'}
          </ThemedText>
          {isPremium && expirationDate && (
            <ThemedText className="text-xs opacity-60">
              {willRenew ? 'Renews' : 'Expires'} {expirationDate.toLocaleDateString()}
            </ThemedText>
          )}
        </View>
        {showManageButton && <Ionicons name="chevron-forward" size={20} color={iconColors.muted} />}
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={`rounded-xl border p-4 ${
        isDark
          ? 'border-secondary-700 bg-background-dark-secondary'
          : 'border-secondary-200 bg-background'
      } ${className}`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="card-outline" size={20} color={STATUS_COLORS.primary} />
          <ThemedText className="text-lg font-semibold">Subscription</ThemedText>
        </View>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator size="small" color={STATUS_COLORS.primary} />
          ) : (
            <Ionicons name="refresh" size={20} color={STATUS_COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      {isPremium ? (
        <View className="gap-3">
          {/* Status */}
          <View className="flex-row justify-between items-center">
            <ThemedText className="text-sm opacity-70">Status</ThemedText>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-success" />
              <Text className="text-sm font-semibold text-success">ACTIVE</Text>
            </View>
          </View>

          {/* Plan */}
          <View className="flex-row justify-between items-center">
            <ThemedText className="text-sm opacity-70">Plan</ThemedText>
            <ThemedText className="text-sm font-medium">Premium</ThemedText>
          </View>

          {/* Expiration/Renewal */}
          {expirationDate && (
            <View className="flex-row justify-between items-center">
              <ThemedText className="text-sm opacity-70">
                {willRenew ? 'Renews' : 'Expires'}
              </ThemedText>
              <ThemedText className="text-sm font-medium">
                {expirationDate.toLocaleDateString()}
              </ThemedText>
            </View>
          )}

          {/* Cancellation warning */}
          {!willRenew && (
            <View className="flex-row items-center gap-2 p-3 rounded-lg mt-2 bg-warning/20">
              <Ionicons name="warning-outline" size={16} color={STATUS_COLORS.warning} />
              <Text className="text-[13px] text-warning-dark flex-1">
                Subscription will not renew
              </Text>
            </View>
          )}

          {/* Manage Button */}
          {showManageButton && (
            <TouchableOpacity
              onPress={handleManageSubscription}
              className="flex-row items-center justify-center gap-2 py-3 mt-2 rounded-lg border border-primary"
            >
              <Ionicons name="settings-outline" size={18} color={STATUS_COLORS.primary} />
              <Text className="font-medium text-primary">Manage Subscription</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View className="items-center py-4">
          <Ionicons name="close-circle-outline" size={32} color={iconColors.subtle} />
          <ThemedText className="mt-2 text-sm opacity-60">No active subscription</ThemedText>
        </View>
      )}
    </View>
  );
}
