/**
 * Switch Component
 *
 * A toggle switch for boolean settings.
 *
 * @example
 * // Basic usage
 * <Switch value={isEnabled} onValueChange={setIsEnabled} />
 *
 * // With label
 * <Switch
 *   label="Enable notifications"
 *   value={notifications}
 *   onValueChange={setNotifications}
 * />
 *
 * // With description
 * <Switch
 *   label="Dark mode"
 *   description="Use dark theme throughout the app"
 *   value={darkMode}
 *   onValueChange={setDarkMode}
 * />
 *
 * // Sizes
 * <Switch size="sm" value={value} onValueChange={setValue} />
 * <Switch size="md" value={value} onValueChange={setValue} />
 * <Switch size="lg" value={value} onValueChange={setValue} />
 *
 * // Colors
 * <Switch color="primary" value={value} onValueChange={setValue} />
 * <Switch color="success" value={value} onValueChange={setValue} />
 *
 * // Disabled
 * <Switch disabled value={true} onValueChange={() => {}} />
 *
 * // As a setting row
 * <SwitchRow
 *   label="Push notifications"
 *   description="Receive push notifications"
 *   value={pushEnabled}
 *   onValueChange={setPushEnabled}
 * />
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, TouchableOpacity, Animated, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSemanticColor } from '@/hooks/use-theme-color';
import { Text } from './Text';

// ===========================================
// TYPES
// ===========================================

export type SwitchSize = 'sm' | 'md' | 'lg';
export type SwitchColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  size?: SwitchSize;
  color?: SwitchColor;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

interface SizeConfig {
  track: { width: number; height: number; borderRadius: number };
  thumb: { size: number; margin: number };
}

const sizeConfigs: Record<SwitchSize, SizeConfig> = {
  sm: {
    track: { width: 36, height: 20, borderRadius: 10 },
    thumb: { size: 16, margin: 2 },
  },
  md: {
    track: { width: 44, height: 24, borderRadius: 12 },
    thumb: { size: 20, margin: 2 },
  },
  lg: {
    track: { width: 52, height: 28, borderRadius: 14 },
    thumb: { size: 24, margin: 2 },
  },
};

// ===========================================
// HOOK FOR SWITCH COLORS
// ===========================================

function useSwitchColors() {
  const primary = useSemanticColor('primary');
  const secondary = useSemanticColor('secondary');
  const accent = useSemanticColor('accent');
  const success = useSemanticColor('success');
  const warning = useSemanticColor('warning');
  const danger = useSemanticColor('danger');
  const info = useSemanticColor('info');

  return useMemo(
    () => ({
      primary,
      secondary,
      accent,
      success,
      warning,
      danger,
      info,
    }),
    [primary, secondary, accent, success, warning, danger, info]
  );
}

// ===========================================
// COMPONENT
// ===========================================

export function Switch({
  value,
  onValueChange,
  label,
  description,
  size = 'md',
  color = 'primary',
  disabled = false,
  className = '',
  style,
}: SwitchProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfigs[size];
  const switchColors = useSwitchColors();
  const colorValue = switchColors[color] || switchColors.primary;

  // Track colors for inactive state
  const trackBgLight = useSemanticColor('secondary', '200');
  const trackBgDark = useSemanticColor('secondary', '700');

  // Animation for thumb position and scale
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Bounce scale effect on toggle
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: value ? 1 : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 4,
          tension: 200,
        }),
      ]),
    ]).start();
  }, [value, translateX, scaleAnim]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  // Calculate thumb translation
  const thumbTranslateX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [
      config.thumb.margin,
      config.track.width - config.thumb.size - config.thumb.margin,
    ],
  });

  // Colors
  const trackColor = value ? colorValue : isDark ? trackBgDark : trackBgLight;

  const thumbColor = '#ffffff';

  const hasLabel = label || description;

  const switchElement = (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        {
          width: config.track.width,
          height: config.track.height,
          borderRadius: config.track.borderRadius,
          backgroundColor: trackColor,
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Animated.View
        style={[
          {
            width: config.thumb.size,
            height: config.thumb.size,
            borderRadius: config.thumb.size / 2,
            backgroundColor: thumbColor,
            transform: [{ translateX: thumbTranslateX }, { scale: scaleAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
          },
        ]}
      />
    </TouchableOpacity>
  );

  // If no label, just return the switch
  if (!hasLabel) {
    return (
      <View className={className} style={style}>
        {switchElement}
      </View>
    );
  }

  // With label/description
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-between ${className}`}
      style={style}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View className="flex-1 mr-3">
        {label && (
          <Text weight="medium" color={disabled ? 'muted' : 'default'}>
            {label}
          </Text>
        )}
        {description && (
          <Text size="sm" color="muted" className="mt-0.5">
            {description}
          </Text>
        )}
      </View>
      {switchElement}
    </TouchableOpacity>
  );
}

// ===========================================
// SWITCH ROW COMPONENT
// ===========================================

export interface SwitchRowProps extends SwitchProps {
  /** Left icon */
  icon?: React.ReactNode;
  /** Show border at bottom */
  bordered?: boolean;
}

export function SwitchRow({ icon, bordered = true, className = '', ...props }: SwitchRowProps) {
  return (
    <View
      className={`py-3 ${bordered ? 'border-b border-border dark:border-border-dark' : ''} ${className}`}
    >
      <View className="flex-row items-center">
        {icon && <View className="mr-3">{icon}</View>}
        <View className="flex-1">
          <Switch {...props} />
        </View>
      </View>
    </View>
  );
}

// ===========================================
// SWITCH GROUP COMPONENT
// ===========================================

export interface SwitchGroupProps {
  children: React.ReactNode;
  /** Group label */
  label?: string;
  className?: string;
}

export function SwitchGroup({ children, label, className = '' }: SwitchGroupProps) {
  return (
    <View className={className}>
      {label && (
        <Text size="sm" color="muted" weight="medium" className="mb-2 uppercase tracking-wider">
          {label}
        </Text>
      )}
      <View className="bg-background dark:bg-background-dark-secondary rounded-xl overflow-hidden">
        {children}
      </View>
    </View>
  );
}
