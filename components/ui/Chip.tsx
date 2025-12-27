/**
 * Chip Component
 *
 * Compact elements for filters, tags, selections, and categories.
 * Supports selection, removal, icons, and multiple styles.
 *
 * @example
 * // Basic chip
 * <Chip label="React Native" />
 *
 * // Selectable chip
 * <Chip
 *   label="Popular"
 *   selected={isSelected}
 *   onPress={() => setIsSelected(!isSelected)}
 * />
 *
 * // Removable chip
 * <Chip
 *   label="Design"
 *   onRemove={() => handleRemove('design')}
 * />
 *
 * // With icon
 * <Chip
 *   label="Location"
 *   icon="location-outline"
 *   selected
 * />
 *
 * // Filter group
 * <ChipGroup
 *   options={['All', 'Active', 'Completed']}
 *   value={filter}
 *   onValueChange={setFilter}
 * />
 *
 * // Multi-select chips
 * <ChipGroup
 *   options={categories}
 *   value={selectedCategories}
 *   onValueChange={setSelectedCategories}
 *   multiple
 * />
 */

import React, { useRef, useCallback } from 'react';
import { View, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Text } from './Text';

// Local color constants for chip variants (match tailwind.config.js)
const CHIP_COLORS: Record<string, { DEFAULT: string; light: string }> = {
  primary: { DEFAULT: '#0a7ea4', light: '#e0f2fe' },
  secondary: { DEFAULT: '#6b7280', light: '#f3f4f6' },
  accent: { DEFAULT: '#8b5cf6', light: '#f3e8ff' },
  success: { DEFAULT: '#22c55e', light: '#dcfce7' },
  warning: { DEFAULT: '#f59e0b', light: '#fef3c7' },
  danger: { DEFAULT: '#ef4444', light: '#fee2e2' },
  info: { DEFAULT: '#3b82f6', light: '#dbeafe' },
};

// ===========================================
// TYPES
// ===========================================

export type ChipVariant = 'solid' | 'soft' | 'outline';
export type ChipColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type ChipSize = 'sm' | 'md' | 'lg';

export interface ChipProps {
  /** Chip label */
  label: string;
  /** Whether chip is selected */
  selected?: boolean;
  /** Press handler */
  onPress?: () => void;
  /** Remove handler (shows X button) */
  onRemove?: () => void;
  /** Left icon */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Avatar image URL (shows circular image) */
  avatar?: string;
  /** Visual variant */
  variant?: ChipVariant;
  /** Color scheme */
  color?: ChipColor;
  /** Size */
  size?: ChipSize;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

interface SizeConfig {
  height: number;
  paddingX: number;
  fontSize: 'xs' | 'sm' | 'base';
  iconSize: number;
  avatarSize: number;
  closeSize: number;
}

const sizeConfigs: Record<ChipSize, SizeConfig> = {
  sm: {
    height: 28,
    paddingX: 10,
    fontSize: 'xs',
    iconSize: 14,
    avatarSize: 20,
    closeSize: 14,
  },
  md: {
    height: 34,
    paddingX: 12,
    fontSize: 'sm',
    iconSize: 16,
    avatarSize: 24,
    closeSize: 16,
  },
  lg: {
    height: 40,
    paddingX: 16,
    fontSize: 'base',
    iconSize: 18,
    avatarSize: 28,
    closeSize: 18,
  },
};

// ===========================================
// COLOR HELPERS
// ===========================================

const getColors = (color: ChipColor, variant: ChipVariant, selected: boolean, isDark: boolean) => {
  const chipColor = CHIP_COLORS[color] || CHIP_COLORS.primary;
  const colorValue = chipColor.DEFAULT;
  const colorLight = chipColor.light;

  if (selected) {
    switch (variant) {
      case 'solid':
        return {
          bg: colorValue,
          text: '#FFFFFF',
          border: colorValue,
          icon: '#FFFFFF',
        };
      case 'soft':
        return {
          bg: isDark ? `${colorValue}30` : colorLight,
          text: colorValue,
          border: 'transparent',
          icon: colorValue,
        };
      case 'outline':
        return {
          bg: isDark ? `${colorValue}15` : `${colorValue}10`,
          text: colorValue,
          border: colorValue,
          icon: colorValue,
        };
    }
  }

  // Unselected state
  return {
    bg: isDark ? '#1F2937' : '#F3F4F6',
    text: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    icon: isDark ? '#9CA3AF' : '#6B7280',
  };
};

// ===========================================
// COMPONENT
// ===========================================

export function Chip({
  label,
  selected = false,
  onPress,
  onRemove,
  icon,
  avatar,
  variant = 'soft',
  color = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: ChipProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfigs[size];
  const colors = getColors(color, variant, selected, isDark);

  // Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  const chipContent = (
    <View
      className={`flex-row items-center ${className}`}
      style={{
        height: config.height,
        paddingHorizontal: config.paddingX,
        borderRadius: config.height / 2,
        backgroundColor: colors.bg,
        borderWidth: variant === 'outline' ? 1.5 : 0,
        borderColor: colors.border,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {/* Avatar */}
      {avatar && (
        <View
          className="rounded-full overflow-hidden mr-2"
          style={{
            width: config.avatarSize,
            height: config.avatarSize,
            marginLeft: -4,
          }}
        >
          {/* Using View as placeholder - in production use Image */}
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: isDark ? '#374151' : '#D1D5DB',
            }}
          />
        </View>
      )}

      {/* Icon */}
      {icon && !avatar && (
        <Ionicons
          name={icon}
          size={config.iconSize}
          color={colors.icon}
          style={{ marginRight: 6 }}
        />
      )}

      {/* Label */}
      <Text size={config.fontSize} weight="medium" style={{ color: colors.text }}>
        {label}
      </Text>

      {/* Selected checkmark */}
      {selected && !onRemove && (
        <Ionicons
          name="checkmark"
          size={config.iconSize}
          color={colors.icon}
          style={{ marginLeft: 6 }}
        />
      )}

      {/* Remove button */}
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ marginLeft: 6, marginRight: -4 }}
        >
          <Ionicons name="close" size={config.closeSize} color={colors.icon} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
        >
          {chipContent}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return chipContent;
}

// ===========================================
// CHIP GROUP COMPONENT
// ===========================================

export interface ChipOption {
  value: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface ChipGroupProps {
  /** Options - can be strings or objects */
  options: (string | ChipOption)[];
  /** Selected value(s) */
  value: string | string[];
  /** Change handler */
  onValueChange: (value: string | string[]) => void;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Visual variant */
  variant?: ChipVariant;
  /** Color scheme */
  color?: ChipColor;
  /** Size */
  size?: ChipSize;
  /** Gap between chips */
  gap?: number;
  /** Horizontal scroll */
  scrollable?: boolean;
  /** Custom className */
  className?: string;
}

export function ChipGroup({
  options,
  value,
  onValueChange,
  multiple = false,
  variant = 'soft',
  color = 'primary',
  size = 'md',
  gap = 8,
  scrollable = false,
  className = '',
}: ChipGroupProps) {
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const isSelected = (optValue: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optValue);
    }
    return value === optValue;
  };

  const handlePress = (optValue: string) => {
    if (multiple && Array.isArray(value)) {
      if (value.includes(optValue)) {
        onValueChange(value.filter((v) => v !== optValue));
      } else {
        onValueChange([...value, optValue]);
      }
    } else {
      onValueChange(optValue);
    }
  };

  const chips = normalizedOptions.map((opt) => (
    <Chip
      key={opt.value}
      label={opt.label}
      icon={opt.icon}
      selected={isSelected(opt.value)}
      onPress={() => handlePress(opt.value)}
      variant={variant}
      color={color}
      size={size}
    />
  ));

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap, paddingHorizontal: 16 }}
        className={className}
      >
        {chips}
      </ScrollView>
    );
  }

  return (
    <View className={`flex-row flex-wrap ${className}`} style={{ gap }}>
      {chips}
    </View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * FilterChip - For filter bars
 */
export function FilterChip(props: ChipProps) {
  return <Chip variant="outline" {...props} />;
}

/**
 * Tag - Non-interactive label chip
 */
export interface TagProps {
  label: string;
  color?: ChipColor;
  size?: ChipSize;
  className?: string;
}

export function Tag({ label, color = 'secondary', size = 'sm', className }: TagProps) {
  return <Chip label={label} color={color} size={size} variant="soft" className={className} />;
}

/**
 * CategoryChip - With icon for categories
 */
export function CategoryChip(props: ChipProps) {
  return <Chip variant="soft" {...props} />;
}
