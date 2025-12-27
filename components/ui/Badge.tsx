/**
 * Badge Component
 *
 * A versatile badge component for status indicators, labels, and notifications.
 *
 * @example
 * // Basic usage
 * <Badge>Default</Badge>
 *
 * // Colors
 * <Badge color="primary">Primary</Badge>
 * <Badge color="success">Success</Badge>
 * <Badge color="warning">Warning</Badge>
 * <Badge color="danger">Error</Badge>
 * <Badge color="info">Info</Badge>
 *
 * // Variants
 * <Badge variant="solid" color="success">Solid</Badge>
 * <Badge variant="soft" color="success">Soft</Badge>
 * <Badge variant="outline" color="success">Outline</Badge>
 *
 * // Sizes
 * <Badge size="sm">Small</Badge>
 * <Badge size="md">Medium</Badge>
 * <Badge size="lg">Large</Badge>
 *
 * // With icon
 * <Badge leftIcon="checkmark" color="success">Verified</Badge>
 * <Badge rightIcon="arrow-forward">Continue</Badge>
 *
 * // Dot badge (no text)
 * <Badge dot color="success" />
 *
 * // Pill shape
 * <Badge rounded>Pill Badge</Badge>
 *
 * // Pressable
 * <Badge onPress={() => console.log('pressed')}>Clickable</Badge>
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSemanticColor } from '@/hooks/use-theme-color';

// ===========================================
// TYPES
// ===========================================

export type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type BadgeVariant = 'solid' | 'soft' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children?: React.ReactNode;
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  dot?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

// ===========================================
// COLOR CONFIGURATIONS
// ===========================================

interface ColorConfig {
  solid: { bg: string; text: string };
  soft: { bg: string; text: string };
  outline: { border: string; text: string };
}

const colorConfigs: Record<BadgeColor, ColorConfig> = {
  primary: {
    solid: { bg: 'bg-primary', text: 'text-white' },
    soft: {
      bg: 'bg-primary-100 dark:bg-primary-900/30',
      text: 'text-primary-700 dark:text-primary-300',
    },
    outline: { border: 'border-primary', text: 'text-primary' },
  },
  secondary: {
    solid: { bg: 'bg-secondary-600', text: 'text-white' },
    soft: {
      bg: 'bg-secondary-100 dark:bg-secondary-800',
      text: 'text-secondary-700 dark:text-secondary-200',
    },
    outline: {
      border: 'border-secondary-400 dark:border-secondary-600',
      text: 'text-secondary-600 dark:text-secondary-300',
    },
  },
  accent: {
    solid: { bg: 'bg-accent', text: 'text-white' },
    soft: {
      bg: 'bg-accent-100 dark:bg-accent-900/30',
      text: 'text-accent-700 dark:text-accent-300',
    },
    outline: { border: 'border-accent', text: 'text-accent' },
  },
  success: {
    solid: { bg: 'bg-success', text: 'text-white' },
    soft: {
      bg: 'bg-success/10 dark:bg-success/20',
      text: 'text-success-dark dark:text-success-light',
    },
    outline: { border: 'border-success', text: 'text-success' },
  },
  warning: {
    solid: { bg: 'bg-warning', text: 'text-white' },
    soft: {
      bg: 'bg-warning/10 dark:bg-warning/20',
      text: 'text-warning-dark dark:text-warning-light',
    },
    outline: { border: 'border-warning', text: 'text-warning' },
  },
  danger: {
    solid: { bg: 'bg-danger', text: 'text-white' },
    soft: { bg: 'bg-danger/10 dark:bg-danger/20', text: 'text-danger-dark dark:text-danger-light' },
    outline: { border: 'border-danger', text: 'text-danger' },
  },
  info: {
    solid: { bg: 'bg-info', text: 'text-white' },
    soft: { bg: 'bg-info/10 dark:bg-info/20', text: 'text-info-dark dark:text-info-light' },
    outline: { border: 'border-info', text: 'text-info' },
  },
};

// ===========================================
// HOOK FOR BADGE ICON COLORS
// ===========================================

function useBadgeIconColors() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const primary = useSemanticColor('primary');
  const secondaryLight = useSemanticColor('secondary', '600');
  const secondaryDark = useSemanticColor('secondary', '300');
  const accent = useSemanticColor('accent');
  const successLight = useSemanticColor('success', 'dark');
  const successDark = useSemanticColor('success', 'light');
  const warningLight = useSemanticColor('warning', 'dark');
  const warningDark = useSemanticColor('warning', 'light');
  const dangerLight = useSemanticColor('danger', 'dark');
  const dangerDark = useSemanticColor('danger', 'light');
  const infoLight = useSemanticColor('info', 'dark');
  const infoDark = useSemanticColor('info', 'light');

  return useMemo(
    () => ({
      primary,
      secondary: isDark ? secondaryDark : secondaryLight,
      accent,
      success: isDark ? successDark : successLight,
      warning: isDark ? warningDark : warningLight,
      danger: isDark ? dangerDark : dangerLight,
      info: isDark ? infoDark : infoLight,
    }),
    [
      primary,
      secondaryLight,
      secondaryDark,
      accent,
      successLight,
      successDark,
      warningLight,
      warningDark,
      dangerLight,
      dangerDark,
      infoLight,
      infoDark,
      isDark,
    ]
  );
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

interface SizeConfig {
  container: string;
  text: string;
  iconSize: number;
  gap: number;
  dot: string;
}

const sizeConfigs: Record<BadgeSize, SizeConfig> = {
  sm: {
    container: 'h-5 px-2',
    text: 'text-[10px] font-medium',
    iconSize: 10,
    gap: 3,
    dot: 'w-2 h-2',
  },
  md: {
    container: 'h-6 px-2.5',
    text: 'text-xs font-medium',
    iconSize: 12,
    gap: 4,
    dot: 'w-2.5 h-2.5',
  },
  lg: {
    container: 'h-7 px-3',
    text: 'text-sm font-medium',
    iconSize: 14,
    gap: 5,
    dot: 'w-3 h-3',
  },
};

// ===========================================
// COMPONENT
// ===========================================

export function Badge({
  children,
  color = 'primary',
  variant = 'soft',
  size = 'md',
  rounded = false,
  dot = false,
  leftIcon,
  rightIcon,
  onPress,
  disabled = false,
  className = '',
  style,
}: BadgeProps) {
  const colorConfig = colorConfigs[color];
  const sizeConfig = sizeConfigs[size];
  const iconColors = useBadgeIconColors();

  // Build container classes
  const getContainerClasses = (): string => {
    const baseClasses = [
      'flex-row items-center justify-center',
      rounded ? 'rounded-full' : 'rounded',
      disabled ? 'opacity-50' : '',
    ];

    if (dot) {
      baseClasses.push(sizeConfig.dot, 'rounded-full');
    } else {
      baseClasses.push(sizeConfig.container);
    }

    switch (variant) {
      case 'solid':
        baseClasses.push(colorConfig.solid.bg);
        break;
      case 'soft':
        baseClasses.push(colorConfig.soft.bg);
        break;
      case 'outline':
        baseClasses.push('border bg-transparent', colorConfig.outline.border);
        break;
    }

    return [...baseClasses, className].filter(Boolean).join(' ');
  };

  // Build text classes
  const getTextClasses = (): string => {
    const baseClasses = [sizeConfig.text];

    switch (variant) {
      case 'solid':
        baseClasses.push(colorConfig.solid.text);
        break;
      case 'soft':
        baseClasses.push(colorConfig.soft.text);
        break;
      case 'outline':
        baseClasses.push(colorConfig.outline.text);
        break;
    }

    return baseClasses.filter(Boolean).join(' ');
  };

  // Get icon color
  const getIconColor = (): string => {
    if (variant === 'solid') return '#ffffff';
    // For soft and outline, use the semantic color from hook
    return iconColors[color] || iconColors.primary;
  };

  const containerClasses = getContainerClasses();
  const textClasses = getTextClasses();
  const iconColor = getIconColor();

  // Render content
  const renderContent = () => {
    if (dot) return null;

    return (
      <View className="flex-row items-center" style={{ gap: sizeConfig.gap }}>
        {leftIcon && <Ionicons name={leftIcon} size={sizeConfig.iconSize} color={iconColor} />}
        {children && <Text className={textClasses}>{children}</Text>}
        {rightIcon && <Ionicons name={rightIcon} size={sizeConfig.iconSize} color={iconColor} />}
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity
        className={containerClasses}
        style={style}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View className={containerClasses} style={style}>
      {renderContent()}
    </View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * Status Badge - Predefined status badges
 */
export type StatusType = 'active' | 'inactive' | 'pending' | 'error' | 'success';

interface StatusBadgeProps extends Omit<BadgeProps, 'color' | 'children'> {
  status: StatusType;
  showDot?: boolean;
}

const statusConfigs: Record<StatusType, { color: BadgeColor; label: string }> = {
  active: { color: 'success', label: 'Active' },
  inactive: { color: 'secondary', label: 'Inactive' },
  pending: { color: 'warning', label: 'Pending' },
  error: { color: 'danger', label: 'Error' },
  success: { color: 'success', label: 'Success' },
};

export function StatusBadge({ status, showDot = true, ...props }: StatusBadgeProps) {
  const config = statusConfigs[status];
  return (
    <Badge color={config.color} leftIcon={showDot ? 'ellipse' : undefined} {...props}>
      {config.label}
    </Badge>
  );
}

/**
 * Count Badge - For notification counts
 */
interface CountBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number;
  max?: number;
}

export function CountBadge({ count, max = 99, ...props }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : String(count);
  return (
    <Badge variant="solid" rounded {...props}>
      {displayCount}
    </Badge>
  );
}

/**
 * Notification Dot - A small dot for notification indicators
 */
export function NotificationDot(props: Omit<BadgeProps, 'dot' | 'children'>) {
  return <Badge dot color="danger" {...props} />;
}
