/**
 * FeatureList component with NativeWind styling
 * Displays a list of product features with checkmark icons
 */

import { ThemedText } from '@/components/themed-text';
import { useSemanticColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

interface FeatureListProps {
  features: string[];
  iconColor?: string;
  className?: string;
}

export function FeatureList({ features, iconColor, className = '' }: FeatureListProps) {
  const successColor = useSemanticColor('success');
  const color = iconColor ?? successColor;
  return (
    <View className={`gap-3 ${className}`}>
      {features.map((feature) => (
        <View key={feature} className="flex-row items-start">
          <View className="mr-3 mt-0.5">
            <Ionicons name="checkmark-circle" size={20} color={color} />
          </View>
          <ThemedText className="text-[15px] flex-1 leading-[22px]">{feature}</ThemedText>
        </View>
      ))}
    </View>
  );
}
