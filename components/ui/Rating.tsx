/**
 * Rating Component
 *
 * Star rating input and display for reviews, feedback, and ratings.
 *
 * @example
 * // Display-only rating
 * <Rating value={4.5} readonly />
 *
 * // Interactive rating
 * <Rating value={rating} onChange={setRating} />
 *
 * // Custom icons and size
 * <Rating
 *   value={rating}
 *   onChange={setRating}
 *   maxValue={10}
 *   size="lg"
 *   icon="heart"
 * />
 *
 * // With label
 * <Rating value={rating} onChange={setRating} showLabel />
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';

// ===========================================
// TYPES
// ===========================================

export type RatingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type RatingIcon = 'star' | 'heart' | 'flame' | 'thumbs-up';

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  maxValue?: number;
  size?: RatingSize;
  icon?: RatingIcon;
  activeColor?: string;
  inactiveColor?: string;
  readonly?: boolean;
  allowHalf?: boolean;
  showLabel?: boolean;
  labelFormat?: (value: number, max: number) => string;
  spacing?: number;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  testID?: string;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

const sizeConfigs: Record<RatingSize, { iconSize: number; spacing: number; labelSize: string }> = {
  xs: { iconSize: 14, spacing: 2, labelSize: 'text-xs' },
  sm: { iconSize: 18, spacing: 3, labelSize: 'text-sm' },
  md: { iconSize: 24, spacing: 4, labelSize: 'text-base' },
  lg: { iconSize: 32, spacing: 6, labelSize: 'text-lg' },
  xl: { iconSize: 40, spacing: 8, labelSize: 'text-xl' },
};

// ===========================================
// ICON MAPPINGS
// ===========================================

const iconMappings: Record<
  RatingIcon,
  {
    filled: keyof typeof Ionicons.glyphMap;
    outline: keyof typeof Ionicons.glyphMap;
    half: keyof typeof Ionicons.glyphMap;
  }
> = {
  star: { filled: 'star', outline: 'star-outline', half: 'star-half' },
  heart: { filled: 'heart', outline: 'heart-outline', half: 'heart-half' },
  flame: { filled: 'flame', outline: 'flame-outline', half: 'flame' },
  'thumbs-up': { filled: 'thumbs-up', outline: 'thumbs-up-outline', half: 'thumbs-up' },
};

// ===========================================
// DEFAULT COLORS
// ===========================================

const defaultColors = {
  star: { active: '#fbbf24', inactive: '#d1d5db' },
  heart: { active: '#ef4444', inactive: '#d1d5db' },
  flame: { active: '#f97316', inactive: '#d1d5db' },
  'thumbs-up': { active: '#22c55e', inactive: '#d1d5db' },
};

// ===========================================
// MAIN RATING COMPONENT
// ===========================================

export function Rating({
  value,
  onChange,
  maxValue = 5,
  size = 'md',
  icon = 'star',
  activeColor,
  inactiveColor,
  readonly = false,
  allowHalf = false,
  showLabel = false,
  labelFormat,
  spacing: customSpacing,
  disabled = false,
  className = '',
  style,
  testID,
}: RatingProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfigs[size];
  const icons = iconMappings[icon];
  const colors = defaultColors[icon];

  const finalActiveColor = activeColor || colors.active;
  const finalInactiveColor = inactiveColor || (isDark ? '#4b5563' : colors.inactive);
  const finalSpacing = customSpacing ?? config.spacing;

  const isInteractive = !readonly && !disabled && onChange;

  const handlePress = useCallback(
    (index: number, isHalf: boolean = false) => {
      if (!isInteractive) return;

      const newValue = isHalf && allowHalf ? index + 0.5 : index + 1;

      // Toggle off if clicking same value
      const finalValue = newValue === value ? 0 : newValue;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange?.(finalValue);
    },
    [isInteractive, onChange, value, allowHalf]
  );

  const renderIcon = (index: number) => {
    const position = index + 1;
    const isFilled = value >= position;
    const isHalfFilled = allowHalf && value >= position - 0.5 && value < position;

    let iconName: keyof typeof Ionicons.glyphMap;
    let iconColor: string;

    if (isFilled) {
      iconName = icons.filled;
      iconColor = finalActiveColor;
    } else if (isHalfFilled) {
      iconName = icons.half;
      iconColor = finalActiveColor;
    } else {
      iconName = icons.outline;
      iconColor = finalInactiveColor;
    }

    const iconElement = <Ionicons name={iconName} size={config.iconSize} color={iconColor} />;

    if (isInteractive) {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => handlePress(index)}
          onLongPress={allowHalf ? () => handlePress(index, true) : undefined}
          disabled={disabled}
          style={{ marginHorizontal: finalSpacing / 2 }}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          accessibilityRole="button"
          accessibilityLabel={`Rate ${position} out of ${maxValue}`}
          accessibilityState={{ selected: isFilled }}
        >
          {iconElement}
        </TouchableOpacity>
      );
    }

    return (
      <View key={index} style={{ marginHorizontal: finalSpacing / 2 }}>
        {iconElement}
      </View>
    );
  };

  const defaultLabelFormat = (val: number, max: number) => `${val}/${max}`;
  const formatLabel = labelFormat || defaultLabelFormat;

  return (
    <View
      className={`flex-row items-center ${disabled ? 'opacity-50' : ''} ${className}`}
      style={style}
      testID={testID}
      accessibilityRole="adjustable"
      accessibilityValue={{ min: 0, max: maxValue, now: value }}
    >
      <View className="flex-row items-center" style={{ marginHorizontal: -finalSpacing / 2 }}>
        {Array.from({ length: maxValue }, (_, i) => renderIcon(i))}
      </View>
      {showLabel && (
        <Text
          className={`ml-2 font-medium ${config.labelSize} ${
            isDark ? 'text-foreground-dark' : 'text-foreground'
          }`}
        >
          {formatLabel(value, maxValue)}
        </Text>
      )}
    </View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * StarRating - Default star rating
 */
export function StarRating(props: Omit<RatingProps, 'icon'>) {
  return <Rating icon="star" {...props} />;
}

/**
 * HeartRating - Heart-based rating
 */
export function HeartRating(props: Omit<RatingProps, 'icon'>) {
  return <Rating icon="heart" {...props} />;
}

/**
 * ReviewRating - Rating with text display
 */
export interface ReviewRatingProps extends Omit<RatingProps, 'showLabel'> {
  reviewCount?: number;
}

export function ReviewRating({ value, reviewCount, ...props }: ReviewRatingProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row items-center">
      <Rating value={value} readonly {...props} />
      <Text
        className={`ml-2 text-sm font-medium ${
          isDark ? 'text-foreground-dark' : 'text-foreground'
        }`}
      >
        {value.toFixed(1)}
      </Text>
      {reviewCount !== undefined && (
        <Text
          className={`ml-1 text-sm ${
            isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'
          }`}
        >
          ({reviewCount.toLocaleString()})
        </Text>
      )}
    </View>
  );
}

/**
 * RatingInput - Rating with form field styling
 */
export interface RatingInputProps extends RatingProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export function RatingInput({
  label,
  error,
  helperText,
  className = '',
  ...props
}: RatingInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={className}>
      {label && (
        <Text
          className={`mb-2 text-sm font-medium ${
            isDark ? 'text-foreground-dark' : 'text-foreground'
          }`}
        >
          {label}
        </Text>
      )}
      <Rating {...props} />
      {error && <Text className="mt-1 text-sm text-danger">{error}</Text>}
      {helperText && !error && (
        <Text
          className={`mt-1 text-sm ${
            isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'
          }`}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}

/**
 * RatingBreakdown - Shows rating distribution
 */
export interface RatingBreakdownProps {
  ratings: Record<number, number>; // { 5: 100, 4: 50, 3: 20, 2: 5, 1: 3 }
  maxValue?: number;
  showCount?: boolean;
  className?: string;
}

export function RatingBreakdown({
  ratings,
  maxValue = 5,
  showCount = true,
  className = '',
}: RatingBreakdownProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const total = Object.values(ratings).reduce((sum, count) => sum + count, 0);

  return (
    <View className={className}>
      {Array.from({ length: maxValue }, (_, i) => maxValue - i).map((rating) => {
        const count = ratings[rating] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <View key={rating} className="flex-row items-center mb-2">
            <View className="flex-row items-center w-12">
              <Text className={`text-sm ${isDark ? 'text-foreground-dark' : 'text-foreground'}`}>
                {rating}
              </Text>
              <Ionicons
                name="star"
                size={12}
                color={isDark ? '#fbbf24' : '#fbbf24'}
                style={{ marginLeft: 2 }}
              />
            </View>
            <View
              className={`flex-1 h-2 mx-2 rounded-full overflow-hidden ${
                isDark ? 'bg-background-dark-tertiary' : 'bg-background-secondary'
              }`}
            >
              <View
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </View>
            {showCount && (
              <Text
                className={`w-12 text-right text-sm ${
                  isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'
                }`}
              >
                {count}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
