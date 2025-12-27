/**
 * CustomTabBar Component
 *
 * A modern tab bar with optional blur effect, haptic feedback,
 * and smooth animations.
 *
 * Features:
 * - Glassmorphism blur effect (requires expo-blur)
 * - Falls back to semi-transparent background if blur unavailable
 * - Press scale animations on tab items
 * - Haptic feedback on tab press
 * - Animated active indicator
 * - Dark/light mode support
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, Animated, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme, withOpacity } from '@/hooks/use-theme-color';
import { SemanticColors } from '@/constants/theme';

// Try to import expo-blur, fallback to null if not available
let BlurView: React.ComponentType<{
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: object;
  children?: React.ReactNode;
}> | null = null;

try {
  // Dynamic import will be handled at build time
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  BlurView = require('expo-blur').BlurView;
} catch {
  // expo-blur not installed, will use fallback
}

interface TabItemProps {
  isFocused: boolean;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  onLongPress: () => void;
  color: string;
  activeColor: string;
}

function TabItem({
  isFocused,
  label,
  icon,
  onPress,
  onLongPress,
  color,
  activeColor,
}: TabItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isFocused ? -2 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [isFocused, translateY]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      className="flex-1 items-center justify-start"
    >
      <Animated.View
        className="items-center justify-center"
        style={{ transform: [{ scale: scaleAnim }, { translateY }] }}
      >
        <View className="mb-0.5">{icon}</View>
        <Text
          className={`text-[10px] tracking-wide ${isFocused ? 'font-semibold' : 'font-medium'}`}
          style={{ color: isFocused ? activeColor : color }}
        >
          {label}
        </Text>
        {isFocused && (
          <View
            className="absolute -top-1.5 h-1 w-1 rounded-full"
            style={{ backgroundColor: activeColor }}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  // Use theme colors - tint for active, tabIconDefault for inactive
  const activeColor = colors.tint;
  const inactiveColor = colors.tabIconDefault;

  // Background colors with opacity for glassmorphism effect
  const backgroundColor = isDark
    ? withOpacity(SemanticColors.secondary[900], 0.85)
    : withOpacity(SemanticColors.secondary[50], 0.85);

  const borderColor = isDark
    ? withOpacity(SemanticColors.secondary[600], 0.5)
    : withOpacity(SemanticColors.secondary[300], 0.5);

  const tabBarHeight = 60 + insets.bottom;

  const content = (
    <View className="flex-1 flex-row pt-2">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? (options.tabBarLabel as string)
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const icon = options.tabBarIcon?.({
          focused: isFocused,
          color: isFocused ? activeColor : inactiveColor,
          size: 24,
        });

        return (
          <TabItem
            key={route.key}
            isFocused={isFocused}
            label={label}
            icon={icon}
            onPress={onPress}
            onLongPress={onLongPress}
            color={inactiveColor}
            activeColor={activeColor}
          />
        );
      })}
    </View>
  );

  // Use blur if available, otherwise fallback to semi-transparent background
  if (BlurView && Platform.OS !== 'web') {
    return (
      <View className="absolute bottom-0 left-0 right-0" style={{ height: tabBarHeight }}>
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={{ flex: 1, borderTopWidth: 0.5, borderTopColor: borderColor }}
        >
          {content}
        </BlurView>
      </View>
    );
  }

  // Fallback without blur
  return (
    <View
      className="absolute bottom-0 left-0 right-0"
      style={{
        height: tabBarHeight,
        backgroundColor,
        borderTopWidth: 0.5,
        borderTopColor: borderColor,
      }}
    >
      {content}
    </View>
  );
}

export default CustomTabBar;
