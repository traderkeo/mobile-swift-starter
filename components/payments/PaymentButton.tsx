/**
 * PaymentButton component with NativeWind styling
 * Reusable button for initiating checkout with press animation
 */

import React, { useRef, useCallback } from 'react';
import { Pressable, ActivityIndicator, Text, Animated } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Local colors for programmatic styling (button backgrounds require hex values)
const BUTTON_COLORS = {
  light: {
    primary: '#0a7ea4',
    secondary: '#e5e7eb', // secondary-200
    text: '#11181C',
  },
  dark: {
    primary: '#0a7ea4',
    secondary: '#374151', // secondary-700
    text: '#ECEDEE',
  },
};

interface PaymentButtonProps {
  onPress: () => void;
  title?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  className?: string;
}

export function PaymentButton({
  onPress,
  title = 'Buy Now',
  loading = false,
  disabled = false,
  variant = 'primary',
  fullWidth = true,
  className = '',
}: PaymentButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';

  // Animation for press feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  }, [scaleAnim]);

  const isDisabled = disabled || loading;

  // Use local color constants for dynamic styling
  const colors = BUTTON_COLORS[colorScheme];
  const backgroundColor = variant === 'primary' ? colors.primary : colors.secondary;
  const textColor = variant === 'primary' ? '#FFFFFF' : colors.text;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        className={`py-4 px-8 rounded-lg items-center justify-center min-h-[52px] ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        style={{
          backgroundColor,
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text className="text-base font-semibold tracking-wide" style={{ color: textColor }}>
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
