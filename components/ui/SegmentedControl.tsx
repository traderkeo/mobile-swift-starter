/**
 * SegmentedControl Component
 *
 * A segmented control for switching between views or filtering options.
 *
 * @example
 * // Basic usage
 * <SegmentedControl
 *   value={tab}
 *   onValueChange={setTab}
 *   options={[
 *     { value: 'all', label: 'All' },
 *     { value: 'active', label: 'Active' },
 *     { value: 'completed', label: 'Completed' },
 *   ]}
 * />
 *
 * // With icons
 * <SegmentedControl
 *   value={view}
 *   onValueChange={setView}
 *   options={[
 *     { value: 'grid', label: 'Grid', icon: 'grid-outline' },
 *     { value: 'list', label: 'List', icon: 'list-outline' },
 *   ]}
 * />
 *
 * // Icon only
 * <SegmentedControl
 *   value={view}
 *   onValueChange={setView}
 *   options={[
 *     { value: 'grid', icon: 'grid-outline' },
 *     { value: 'list', icon: 'list-outline' },
 *   ]}
 * />
 *
 * // Sizes
 * <SegmentedControl size="sm" ... />
 * <SegmentedControl size="md" ... />
 * <SegmentedControl size="lg" ... />
 *
 * // Full width
 * <SegmentedControl fullWidth ... />
 *
 * // Pill style
 * <SegmentedControl variant="pill" ... />
 */

import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, LayoutChangeEvent, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Text } from './Text';

// ===========================================
// TYPES
// ===========================================

export type SegmentedControlSize = 'sm' | 'md' | 'lg';
export type SegmentedControlVariant = 'default' | 'pill';

export interface SegmentedControlOption {
  value: string;
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SegmentedControlOption[];
  size?: SegmentedControlSize;
  variant?: SegmentedControlVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

interface SizeConfig {
  height: number;
  padding: number;
  fontSize: string;
  iconSize: number;
  gap: number;
}

const sizeConfigs: Record<SegmentedControlSize, SizeConfig> = {
  sm: { height: 32, padding: 4, fontSize: 'text-xs', iconSize: 14, gap: 4 },
  md: { height: 40, padding: 4, fontSize: 'text-sm', iconSize: 16, gap: 6 },
  lg: { height: 48, padding: 4, fontSize: 'text-base', iconSize: 18, gap: 8 },
};

// ===========================================
// COMPONENT
// ===========================================

export function SegmentedControl({
  value,
  onValueChange,
  options,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  disabled = false,
  className = '',
  style,
}: SegmentedControlProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfigs[size];

  // Animation for the sliding indicator
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [segmentWidths, setSegmentWidths] = React.useState<number[]>([]);
  const [segmentPositions, setSegmentPositions] = React.useState<number[]>([]);

  const selectedIndex = options.findIndex((opt) => opt.value === value);

  // Update animation when selection changes
  useEffect(() => {
    if (segmentPositions.length > 0 && selectedIndex >= 0) {
      Animated.spring(slideAnim, {
        toValue: segmentPositions[selectedIndex] || 0,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }).start();
    }
  }, [selectedIndex, segmentPositions, slideAnim]);

  // Track segment layouts
  const handleSegmentLayout = (index: number, event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;
    setSegmentWidths((prev) => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
    setSegmentPositions((prev) => {
      const newPositions = [...prev];
      newPositions[index] = x;
      return newPositions;
    });
  };

  // Colors
  const bgColor = isDark ? '#1f2937' : '#f3f4f6';
  const activeBgColor = isDark ? '#374151' : '#ffffff';
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const activeTextColor = isDark ? '#ffffff' : '#111827';

  const borderRadius = variant === 'pill' ? config.height / 2 : 8;
  const segmentBorderRadius = variant === 'pill' ? (config.height - config.padding * 2) / 2 : 6;

  return (
    <View
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      style={[
        {
          backgroundColor: bgColor,
          borderRadius,
          height: config.height,
          padding: config.padding,
          flexDirection: 'row',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {/* Animated indicator */}
      {segmentWidths[selectedIndex] && (
        <Animated.View
          style={{
            position: 'absolute',
            top: config.padding,
            bottom: config.padding,
            width: segmentWidths[selectedIndex],
            backgroundColor: activeBgColor,
            borderRadius: segmentBorderRadius,
            transform: [{ translateX: slideAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      )}

      {/* Segments */}
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const isDisabled = disabled || option.disabled;
        const hasIcon = !!option.icon;
        const hasLabel = !!option.label;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => !isDisabled && onValueChange(option.value)}
            disabled={isDisabled}
            activeOpacity={0.7}
            onLayout={(event) => handleSegmentLayout(index, event)}
            style={{
              flex: fullWidth ? 1 : undefined,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: hasLabel ? 12 : 8,
              height: '100%',
              gap: hasIcon && hasLabel ? config.gap : 0,
            }}
          >
            {option.icon && (
              <Ionicons
                name={option.icon}
                size={config.iconSize}
                color={isSelected ? activeTextColor : textColor}
              />
            )}
            {option.label && (
              <Text
                className={config.fontSize}
                weight={isSelected ? 'semibold' : 'medium'}
                style={{ color: isSelected ? activeTextColor : textColor }}
              >
                {option.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ===========================================
// TAB BAR COMPONENT
// ===========================================

export interface TabBarProps extends Omit<SegmentedControlProps, 'variant'> {
  /** Show indicator line instead of background */
  underline?: boolean;
}

export function TabBar({
  value,
  onValueChange,
  options,
  size = 'md',
  fullWidth = true,
  underline = true,
  disabled = false,
  className = '',
  style,
}: TabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfigs[size];

  // Animation for the sliding indicator
  const slideAnim = useRef(new Animated.Value(0)).current;
  const widthAnim = useRef(new Animated.Value(0)).current;
  const [segmentWidths, setSegmentWidths] = React.useState<number[]>([]);
  const [segmentPositions, setSegmentPositions] = React.useState<number[]>([]);

  const selectedIndex = options.findIndex((opt) => opt.value === value);

  // Update animation when selection changes
  useEffect(() => {
    if (segmentPositions.length > 0 && selectedIndex >= 0) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: segmentPositions[selectedIndex] || 0,
          useNativeDriver: false,
          friction: 8,
          tension: 100,
        }),
        Animated.spring(widthAnim, {
          toValue: segmentWidths[selectedIndex] || 0,
          useNativeDriver: false,
          friction: 8,
          tension: 100,
        }),
      ]).start();
    }
  }, [selectedIndex, segmentPositions, segmentWidths, slideAnim, widthAnim]);

  const handleSegmentLayout = (index: number, event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;
    setSegmentWidths((prev) => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
    setSegmentPositions((prev) => {
      const newPositions = [...prev];
      newPositions[index] = x;
      return newPositions;
    });
  };

  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const activeTextColor = isDark ? '#ffffff' : '#0a7ea4';
  const indicatorColor = '#0a7ea4';

  return (
    <View
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      style={[
        {
          flexDirection: 'row',
          borderBottomWidth: underline ? 1 : 0,
          borderBottomColor: isDark ? '#374151' : '#e5e7eb',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {/* Animated indicator line */}
      {underline && segmentWidths[selectedIndex] && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            height: 2,
            backgroundColor: indicatorColor,
            left: slideAnim,
            width: widthAnim,
          }}
        />
      )}

      {/* Tabs */}
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const isDisabled = disabled || option.disabled;
        const hasIcon = !!option.icon;
        const hasLabel = !!option.label;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => !isDisabled && onValueChange(option.value)}
            disabled={isDisabled}
            activeOpacity={0.7}
            onLayout={(event) => handleSegmentLayout(index, event)}
            style={{
              flex: fullWidth ? 1 : undefined,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              gap: hasIcon && hasLabel ? config.gap : 0,
            }}
          >
            {option.icon && (
              <Ionicons
                name={option.icon}
                size={config.iconSize}
                color={isSelected ? activeTextColor : textColor}
              />
            )}
            {option.label && (
              <Text
                className={config.fontSize}
                weight={isSelected ? 'semibold' : 'medium'}
                style={{ color: isSelected ? activeTextColor : textColor }}
              >
                {option.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
