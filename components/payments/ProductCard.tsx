/**
 * ProductCard component with NativeWind styling
 * Complete premium plan card with badge, pricing, features, and checkout button
 */

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { View, Text } from 'react-native';
import { FeatureList } from './FeatureList';
import { PaymentButton } from './PaymentButton';
import { PricingDisplay } from './PricingDisplay';

interface ProductCardProps {
  badge?: string;
  price: string;
  period: string;
  description?: string;
  features: string[];
  buttonText: string;
  disclaimer?: string;
  onCheckout: () => void;
  loading?: boolean;
  className?: string;
}

export function ProductCard({
  badge,
  price,
  period,
  description,
  features,
  buttonText,
  disclaimer,
  onCheckout,
  loading = false,
  className = '',
}: ProductCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className={`rounded-2xl border-2 p-6 shadow-lg ${
        isDark
          ? 'bg-background-dark-secondary border-secondary-700'
          : 'bg-background border-secondary-200'
      } ${className}`}
    >
      {/* Badge (if provided) */}
      {badge && (
        <View className="absolute top-4 right-4 bg-success px-3 py-1.5 rounded-lg">
          <Text className="text-white text-[11px] font-bold tracking-wide">{badge}</Text>
        </View>
      )}

      {/* Pricing */}
      <PricingDisplay price={price} period={period} description={description} />

      {/* Features */}
      <View className="mb-8">
        <FeatureList features={features} />
      </View>

      {/* Checkout Button */}
      <View className="mb-4">
        <PaymentButton onPress={onCheckout} title={buttonText} loading={loading} />
      </View>

      {/* Disclaimer */}
      {disclaimer && (
        <ThemedText className="text-xs text-center opacity-60">{disclaimer}</ThemedText>
      )}
    </View>
  );
}
