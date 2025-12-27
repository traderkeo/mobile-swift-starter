/**
 * Paywall Component
 * Full-featured paywall that fetches products from RevenueCat and handles purchases
 *
 * Usage:
 * <Paywall onPurchaseComplete={() => router.back()} />
 */

import React from 'react';
import { View, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useTheme, useSemanticColor } from '@/hooks/use-theme-color';
import { useRevenueCat, RevenueCatProduct } from '@/hooks/use-revenuecat';
import { HEADER_CONFIG, SUBSCRIPTION_DISCLAIMERS, getPackageDisplayInfo } from '@/config/product';
import { FeatureList } from './FeatureList';
import { PaymentButton } from './PaymentButton';
import { LoadingOverlay } from './LoadingOverlay';
import { PaywallSkeleton } from '@/components/ui/Skeleton';
import * as Haptics from 'expo-haptics';

interface PaywallProps {
  /** Called when purchase completes successfully */
  onPurchaseComplete?: () => void;
  /** Called when user dismisses the paywall */
  onDismiss?: () => void;
  /** Custom header title */
  title?: string;
  /** Custom header subtitle */
  subtitle?: string;
  /** Features to display (if not using product-specific) */
  features?: string[];
  /** Show close button */
  showCloseButton?: boolean;
}

export function Paywall({
  onPurchaseComplete,
  onDismiss,
  title = HEADER_CONFIG.title,
  subtitle = HEADER_CONFIG.subtitle,
  features,
  showCloseButton = true,
}: PaywallProps) {
  const { isDark, colors } = useTheme();
  const primaryColor = useSemanticColor('primary');
  const successColor = useSemanticColor('success');
  const dangerColor = useSemanticColor('danger');
  const { isReady, isLoading, error, isPremium, products, purchasePackage, restorePurchases } =
    useRevenueCat();

  const [selectedProduct, setSelectedProduct] = React.useState<RevenueCatProduct | null>(null);
  const [purchaseLoading, setPurchaseLoading] = React.useState(false);
  const [restoreLoading, setRestoreLoading] = React.useState(false);

  // Auto-select first product when loaded
  React.useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      // Prefer monthly, then first available
      const monthly = products.find((p) => p.packageType === '$rc_monthly');
      setSelectedProduct(monthly || products[0]);
    }
  }, [products, selectedProduct]);

  // If already premium, show success state
  if (isPremium) {
    return (
      <View
        className={`flex-1 justify-center items-center p-8 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
      >
        <View className="w-20 h-20 rounded-full bg-success/20 justify-center items-center mb-6">
          <Ionicons name="checkmark-circle" size={48} color={successColor} />
        </View>
        <ThemedText className="text-2xl font-bold mb-2">You&apos;re Premium!</ThemedText>
        <ThemedText className="text-base opacity-70 text-center mb-6">
          You have full access to all premium features.
        </ThemedText>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} className="py-3 px-8 rounded-xl bg-primary">
            <Text className="text-white font-semibold">Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const handlePurchase = async () => {
    if (!selectedProduct) return;

    setPurchaseLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const success = await purchasePackage(selectedProduct.package);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onPurchaseComplete?.();
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      Alert.alert('Purchase Failed', error.message || 'Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoreLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const success = await restorePurchases();
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Restored!', 'Your purchases have been restored.');
        onPurchaseComplete?.();
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases were found to restore.');
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      Alert.alert('Restore Failed', error.message || 'Please try again.');
    } finally {
      setRestoreLoading(false);
    }
  };

  if (!isReady) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
        <PaywallSkeleton />
      </View>
    );
  }

  if (error || products.length === 0) {
    return (
      <View
        className={`flex-1 justify-center items-center p-8 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
      >
        <Ionicons name="alert-circle-outline" size={48} color={dangerColor} />
        <ThemedText className="text-lg font-semibold mt-4 mb-2">Unable to Load Products</ThemedText>
        <ThemedText className="text-center opacity-70 mb-6">
          {error || 'No products available. Please check your connection and try again.'}
        </ThemedText>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} className="py-3 px-8 rounded-xl bg-secondary-500">
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const defaultFeatures = [
    'Unlimited access to all features',
    'Priority customer support',
    'Advanced analytics dashboard',
    'Remove all advertisements',
    'Early access to new features',
  ];

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
      {/* Close Button - More visible with background */}
      {showCloseButton && onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          className={`absolute top-4 left-4 z-10 p-2.5 rounded-full ${
            isDark ? 'bg-secondary-800' : 'bg-secondary-100'
          }`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingTop: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-full bg-primary/20 justify-center items-center mb-4">
            <Ionicons name="star" size={32} color={primaryColor} />
          </View>
          <ThemedText className="text-3xl font-bold mb-2 text-center">{title}</ThemedText>
          <ThemedText className="text-base opacity-70 text-center">{subtitle}</ThemedText>
        </View>

        {/* Features */}
        <View className="mb-8">
          <FeatureList features={features || defaultFeatures} />
        </View>

        {/* Product Options */}
        <View className="mb-6 gap-3">
          {products.map((product) => {
            const isSelected = selectedProduct?.identifier === product.identifier;
            const displayInfo = getPackageDisplayInfo(product.packageType);
            const hasTrial = product.trial?.hasFreeTrial;

            return (
              <TouchableOpacity
                key={product.identifier}
                onPress={() => setSelectedProduct(product)}
                className={`p-4 rounded-xl border-2 ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : isDark
                      ? 'border-secondary-700 bg-background-dark-secondary'
                      : 'border-secondary-200 bg-background'
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <ThemedText className="text-lg font-semibold">
                        {product.title.replace(' (AppName)', '').replace(' (Your App)', '')}
                      </ThemedText>
                      {hasTrial && (
                        <View className="bg-primary px-2 py-0.5 rounded">
                          <Text className="text-white text-[10px] font-bold">FREE TRIAL</Text>
                        </View>
                      )}
                      {!hasTrial && displayInfo.badge && (
                        <View className="bg-success px-2 py-0.5 rounded">
                          <Text className="text-white text-[10px] font-bold">
                            {displayInfo.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    {hasTrial && product.trial && (
                      <ThemedText className="text-sm text-primary mt-1">
                        {product.trial.trialDurationText} free, then {product.priceString}
                      </ThemedText>
                    )}
                    {!hasTrial && displayInfo.savings && (
                      <ThemedText className="text-sm text-success mt-1">
                        {displayInfo.savings}
                      </ThemedText>
                    )}
                  </View>
                  <View className="items-end">
                    <ThemedText className="text-lg font-bold">
                      {hasTrial ? 'FREE' : product.priceString}
                    </ThemedText>
                    <ThemedText className="text-sm opacity-60">
                      {hasTrial
                        ? `then ${product.priceString}`
                        : product.packageType === '$rc_annual'
                          ? '/year'
                          : product.packageType === '$rc_monthly'
                            ? '/month'
                            : product.packageType === '$rc_weekly'
                              ? '/week'
                              : ''}
                    </ThemedText>
                  </View>
                </View>
                {/* Selection indicator */}
                <View className="absolute right-4 top-1/2 -translate-y-1/2">
                  <View
                    className={`w-6 h-6 rounded-full border-2 justify-center items-center ${
                      isSelected ? 'border-primary bg-primary' : 'border-secondary-400'
                    }`}
                  >
                    {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Subscribe Button */}
        <View className="mb-4">
          <PaymentButton
            onPress={handlePurchase}
            title={
              selectedProduct?.trial?.hasFreeTrial
                ? `Start ${selectedProduct.trial.trialDurationText} Free Trial`
                : `Subscribe ${selectedProduct?.priceString || ''}`
            }
            loading={purchaseLoading}
            disabled={!selectedProduct || isLoading}
          />
        </View>

        {/* Restore Purchases - Elevated to secondary button per Apple guidelines */}
        <TouchableOpacity
          onPress={handleRestore}
          disabled={restoreLoading}
          className={`flex-row items-center justify-center gap-2 py-3.5 px-6 rounded-xl mb-6 border ${
            isDark
              ? 'border-secondary-600 bg-secondary-800/50'
              : 'border-secondary-300 bg-secondary-50'
          }`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {restoreLoading ? (
            <ActivityIndicator size="small" color={primaryColor} />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={18} color={primaryColor} />
              <ThemedText className="text-primary font-semibold">Restore Purchases</ThemedText>
            </>
          )}
        </TouchableOpacity>

        {/* Legal Disclaimer */}
        <ThemedText className="text-xs text-center opacity-50 leading-5 mb-4">
          {selectedProduct?.trial?.hasFreeTrial
            ? SUBSCRIPTION_DISCLAIMERS.trial
            : SUBSCRIPTION_DISCLAIMERS.full}
        </ThemedText>

        {/* Legal Links */}
        <View className="flex-row justify-center gap-4">
          <TouchableOpacity onPress={() => router.push('/legal/terms')}>
            <ThemedText className="text-xs text-primary">Terms of Service</ThemedText>
          </TouchableOpacity>
          <ThemedText className="text-xs opacity-50">|</ThemedText>
          <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
            <ThemedText className="text-xs text-primary">Privacy Policy</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay visible={purchaseLoading} message="Processing purchase..." />
    </View>
  );
}
