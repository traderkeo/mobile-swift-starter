/**
 * UsageQuotaDisplay Component
 * Shows subscription status and upgrade options
 *
 * Usage:
 * <UsageQuotaDisplay />
 *
 * Or with compact mode:
 * <UsageQuotaDisplay compact />
 */

import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRevenueCat } from '@/hooks/use-revenuecat';

// Local color constants for icons (match tailwind.config.js)
const ICON_COLORS = {
  primary: '#0a7ea4',
  success: '#22c55e',
  secondary400: '#9ca3af',
};

interface UsageQuotaDisplayProps {
  /** Compact display mode */
  compact?: boolean;
  /** Custom class name */
  className?: string;
  /** Show upgrade prompt for free users */
  showUpgradePrompt?: boolean;
  /** Callback when upgrade is tapped */
  onUpgrade?: () => void;
}

// Static arrays moved outside component to prevent recreation on each render
const PREMIUM_BENEFITS = [
  'Unlimited access to all features',
  'Priority support',
  'No ads or interruptions',
] as const;

const FREE_PLAN_LIMITS = ['Limited features', 'Standard support', 'May include ads'] as const;

export function UsageQuotaDisplay({
  compact = false,
  className = '',
  showUpgradePrompt = true,
  onUpgrade,
}: UsageQuotaDisplayProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isPremium, customerInfo } = useRevenueCat();

  // Get entitlement expiration date if premium
  const premiumEntitlement = customerInfo?.entitlements.active['premium'];
  const expirationDate = useMemo(
    () => (premiumEntitlement?.expirationDate ? new Date(premiumEntitlement.expirationDate) : null),
    [premiumEntitlement?.expirationDate]
  );
  const willRenew = premiumEntitlement?.willRenew ?? false;

  if (compact) {
    return (
      <View
        className={`flex-row items-center gap-3 p-3 rounded-xl border ${
          isDark
            ? 'border-secondary-700 bg-background-dark-secondary'
            : 'border-secondary-200 bg-background'
        } ${className}`}
      >
        <View
          className={`w-10 h-10 rounded-full justify-center items-center ${
            isPremium ? 'bg-success/20' : 'bg-primary/20'
          }`}
        >
          <Ionicons
            name={isPremium ? 'star' : 'flash'}
            size={20}
            color={isPremium ? ICON_COLORS.success : ICON_COLORS.primary}
          />
        </View>
        <View className="flex-1">
          <ThemedText className="text-sm font-medium">
            {isPremium ? 'Premium Access' : 'Free Plan'}
          </ThemedText>
          {isPremium && expirationDate && (
            <ThemedText className="text-xs opacity-60">
              {willRenew ? 'Renews' : 'Expires'} {expirationDate.toLocaleDateString()}
            </ThemedText>
          )}
          {!isPremium && (
            <ThemedText className="text-xs opacity-60">Upgrade for unlimited access</ThemedText>
          )}
        </View>
      </View>
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
          <Ionicons name={isPremium ? 'star' : 'flash'} size={20} color={ICON_COLORS.primary} />
          <ThemedText className="text-lg font-semibold">Your Plan</ThemedText>
        </View>
        <View
          className={`px-2 py-1 rounded ${
            isPremium ? 'bg-success/20' : 'bg-secondary-200 dark:bg-secondary-700'
          }`}
        >
          <ThemedText className={`text-xs font-medium ${isPremium ? 'text-success' : ''}`}>
            {isPremium ? 'Premium' : 'Free'}
          </ThemedText>
        </View>
      </View>

      {isPremium ? (
        <View className="gap-3">
          {/* Premium Benefits */}
          <View className="gap-2">
            {PREMIUM_BENEFITS.map((benefit) => (
              <View key={benefit} className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={ICON_COLORS.success} />
                <ThemedText className="text-sm">{benefit}</ThemedText>
              </View>
            ))}
          </View>

          {/* Expiration info */}
          {expirationDate && (
            <View className="flex-row justify-between items-center pt-3 border-t border-secondary-200 dark:border-secondary-700">
              <ThemedText className="text-sm opacity-70">
                {willRenew ? 'Renews' : 'Expires'}
              </ThemedText>
              <ThemedText className="text-sm font-medium">
                {expirationDate.toLocaleDateString()}
              </ThemedText>
            </View>
          )}
        </View>
      ) : (
        <View className="gap-4">
          {/* Free Plan Limits */}
          <View className="gap-2">
            <ThemedText className="text-sm opacity-70">Current limitations:</ThemedText>
            {FREE_PLAN_LIMITS.map((limit) => (
              <View key={limit} className="flex-row items-center gap-2">
                <Ionicons name="close-circle" size={16} color={ICON_COLORS.secondary400} />
                <ThemedText className="text-sm opacity-70">{limit}</ThemedText>
              </View>
            ))}
          </View>

          {/* Upgrade Prompt */}
          {showUpgradePrompt && (
            <TouchableOpacity
              onPress={onUpgrade}
              className="flex-row items-center justify-center gap-2 py-3 rounded-lg bg-primary"
            >
              <Ionicons name="arrow-up-circle" size={18} color="white" />
              <Text className="text-white font-semibold">Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
