/**
 * PricingDisplay component with NativeWind styling
 * Displays price, period, and description for a product
 */

import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { View } from 'react-native';

interface PricingDisplayProps {
  price: string;
  period: string;
  description?: string;
  className?: string;
}

export function PricingDisplay({
  price,
  period,
  description,
  className = '',
}: PricingDisplayProps) {
  return (
    <View className={`mb-6 ${className}`}>
      <View className="flex-row items-baseline mb-3">
        <ThemedText className="text-[32px] font-bold">{price}</ThemedText>
        <ThemedText className="text-xl ml-2 opacity-70">{period}</ThemedText>
      </View>
      {description && <ThemedText className="text-base opacity-80">{description}</ThemedText>}
    </View>
  );
}
