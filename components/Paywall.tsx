/**
 * Modal Paywall Component (Legacy)
 *
 * @deprecated Use Paywall from @/components/payments instead.
 * This component is kept for backward compatibility only.
 *
 * The preferred Paywall uses RevenueCat for product fetching and purchases.
 *
 * Migration:
 * ```tsx
 * // Old usage (this component)
 * import { Paywall } from '@/components/Paywall';
 * <Paywall visible={show} onClose={() => setShow(false)} />
 *
 * // New usage (recommended)
 * import { Paywall } from '@/components/payments';
 * <Paywall onPurchaseComplete={() => router.back()} />
 * ```
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRevenueCat } from '@/hooks/use-revenuecat';
import type { PurchasesPackage } from 'react-native-purchases';
import {
  PRODUCT_CONFIG,
  SUBSCRIPTION_DISCLAIMERS,
  PRODUCT_DISPLAY,
  PACKAGE_TYPES,
} from '@/config/product';

// Local color constants (match tailwind.config.js)
const THEME_COLORS = {
  light: {
    text: '#11181C',
    textMuted: '#687076',
    textSubtle: '#9BA1A6',
    divider: '#e5e7eb',
  },
  dark: {
    text: '#ECEDEE',
    textMuted: '#9BA1A6',
    textSubtle: '#687076',
    divider: '#374151',
  },
};

const STATUS_COLORS = {
  primary: '#0a7ea4',
};

/**
 * Product tier type based on RevenueCat package types
 */
type ProductTier = 'weekly' | 'monthly' | 'yearly';

interface TierDisplay {
  key: ProductTier;
  name: string;
  description: string;
  price: string;
  period: string;
  badge?: string | null;
  savings?: string | null;
  package: PurchasesPackage;
}

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseComplete?: () => void;
  title?: string;
  subtitle?: string;
  features?: string[];
  allowClose?: boolean;
}

/**
 * @deprecated Use Paywall from @/components/payments instead
 */
export function Paywall({
  visible,
  onClose,
  onPurchaseComplete,
  title = 'Unlock Premium',
  subtitle = 'Get access to all features',
  features = PRODUCT_CONFIG.features,
  allowClose = true,
}: PaywallProps) {
  const [selectedTier, setSelectedTier] = useState<ProductTier>('monthly');
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const { products, purchasePackage, restorePurchases, isLoading } = useRevenueCat();

  // Theme colors
  const colors = THEME_COLORS[colorScheme];

  // Map RevenueCat products to display tiers
  const tiers = useMemo((): TierDisplay[] => {
    const tierMap: { key: ProductTier; packageType: string }[] = [
      { key: 'weekly', packageType: PACKAGE_TYPES.WEEKLY },
      { key: 'monthly', packageType: PACKAGE_TYPES.MONTHLY },
      { key: 'yearly', packageType: PACKAGE_TYPES.ANNUAL },
    ];

    return tierMap
      .map(({ key, packageType }): TierDisplay | null => {
        const product = products.find((p) => p.packageType === packageType);
        if (!product) return null;

        const display = PRODUCT_DISPLAY[key];
        return {
          key,
          name: product.title.replace(' (AppName)', '').replace(' (Your App)', ''),
          description: display.description,
          price: product.priceString,
          period: key === 'yearly' ? '/year' : key === 'monthly' ? '/month' : '/week',
          badge: display.badge,
          savings: display.savings,
          package: product.package,
        };
      })
      .filter((tier): tier is TierDisplay => tier !== null);
  }, [products]);

  const selectedProduct = useMemo(
    () => tiers.find((t) => t.key === selectedTier),
    [tiers, selectedTier]
  );

  const handlePurchase = useCallback(async () => {
    if (!selectedProduct) return;

    try {
      const success = await purchasePackage(selectedProduct.package);
      if (success) {
        onPurchaseComplete?.();
        onClose();
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  }, [selectedProduct, purchasePackage, onPurchaseComplete, onClose]);

  const handleRestore = useCallback(async () => {
    const success = await restorePurchases();
    if (success) {
      onPurchaseComplete?.();
      onClose();
    }
  }, [restorePurchases, onPurchaseComplete, onClose]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-2">
          {allowClose && (
            <TouchableOpacity className="p-2" onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          )}
          {Platform.OS === 'ios' && (
            <TouchableOpacity className="p-2" onPress={handleRestore} disabled={isLoading}>
              <Text className="text-base font-semibold text-primary">Restore</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-3xl justify-center items-center mb-5 bg-primary/15">
              <Ionicons name="star" size={48} color={STATUS_COLORS.primary} />
            </View>
            <Text className="text-[28px] font-bold mb-2 text-center" style={{ color: colors.text }}>
              {title}
            </Text>
            <Text className="text-base text-center" style={{ color: colors.textMuted }}>
              {subtitle}
            </Text>
          </View>

          {/* Features */}
          <View className="mb-8 gap-3">
            {features.map((feature, index) => (
              <View key={`feature-${index}`} className="flex-row items-center gap-3">
                <Ionicons name="checkmark-circle" size={22} color={STATUS_COLORS.primary} />
                <Text className="text-base flex-1" style={{ color: colors.text }}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Tier Selection */}
          {tiers.length === 0 ? (
            <View className="items-center py-8">
              <ActivityIndicator color={STATUS_COLORS.primary} />
              <Text className="mt-4 opacity-70" style={{ color: colors.text }}>
                Loading products...
              </Text>
            </View>
          ) : (
            <View className="gap-3 mb-5">
              {tiers.map((tier) => {
                const isSelected = selectedTier === tier.key;
                return (
                  <TouchableOpacity
                    key={tier.key}
                    className={`flex-row items-center p-4 rounded-[14px] border-2 relative overflow-hidden ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border dark:border-border-dark'
                    }`}
                    onPress={() => setSelectedTier(tier.key)}
                    activeOpacity={0.7}
                  >
                    {/* Badge */}
                    {tier.badge && (
                      <View className="absolute top-0 right-0 px-2.5 py-1 rounded-bl-lg bg-primary">
                        <Text className="text-white text-[10px] font-bold tracking-wide">
                          {tier.badge}
                        </Text>
                      </View>
                    )}

                    {/* Selection indicator */}
                    <View
                      className={`w-[22px] h-[22px] rounded-full border-2 justify-center items-center mr-3.5 ${
                        isSelected ? 'border-primary bg-primary' : 'border-secondary-400'
                      }`}
                    >
                      {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </View>

                    {/* Tier info */}
                    <View className="flex-1">
                      <Text
                        className="text-[17px] font-semibold mb-0.5"
                        style={{ color: colors.text }}
                      >
                        {tier.name}
                      </Text>
                      <Text className="text-[13px]" style={{ color: colors.textMuted }}>
                        {tier.description}
                      </Text>
                    </View>

                    {/* Price */}
                    <View className="items-end">
                      <Text className="text-lg font-bold" style={{ color: colors.text }}>
                        {tier.price}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.textSubtle }}>
                        {tier.period}
                      </Text>
                      {tier.savings && (
                        <Text className="text-[11px] font-semibold mt-0.5 text-primary">
                          {tier.savings}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Purchase button */}
          <TouchableOpacity
            className="h-14 rounded-[14px] justify-center items-center mb-5 bg-primary"
            style={{ opacity: !selectedProduct ? 0.5 : 1 }}
            onPress={handlePurchase}
            disabled={isLoading || !selectedProduct}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-[17px] font-bold">
                {selectedProduct
                  ? `Subscribe for ${selectedProduct.price}${selectedProduct.period}`
                  : 'Loading...'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Apple-compliant disclaimer */}
          <Text
            className="text-[11px] leading-4 text-center mb-4"
            style={{ color: colors.textSubtle }}
          >
            {SUBSCRIPTION_DISCLAIMERS.full}
          </Text>

          {/* Legal links */}
          <View className="flex-row justify-center items-center gap-2">
            <TouchableOpacity onPress={() => router.push('/legal/terms')}>
              <Text className="text-[13px] font-medium text-primary">Terms of Service</Text>
            </TouchableOpacity>
            <Text className="text-[13px]" style={{ color: colors.divider }}>
              |
            </Text>
            <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
              <Text className="text-[13px] font-medium text-primary">Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

/**
 * Hook for showing the paywall
 * @deprecated Use the Paywall component from @/components/payments directly
 */
export function usePaywall() {
  const [visible, setVisible] = useState(false);

  const showPaywall = useCallback(() => setVisible(true), []);
  const hidePaywall = useCallback(() => setVisible(false), []);

  return {
    visible,
    showPaywall,
    hidePaywall,
  };
}
