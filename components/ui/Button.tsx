/**
 * Button Component
 *
 * A highly customizable button with multiple variants, sizes, and styles.
 *
 * @example
 * // Basic usage
 * <Button onPress={handlePress}>Submit</Button>
 *
 * // Color variants
 * <Button color="success">Save</Button>
 * <Button color="danger">Delete</Button>
 * <Button color="warning">Warning</Button>
 *
 * // Style variants
 * <Button variant="solid" color="primary">Solid</Button>
 * <Button variant="soft" color="primary">Soft</Button>
 * <Button variant="outline" color="primary">Outline</Button>
 * <Button variant="ghost" color="primary">Ghost</Button>
 *
 * // Sizes
 * <Button size="xs">Extra Small</Button>
 * <Button size="sm">Small</Button>
 * <Button size="md">Medium</Button>
 * <Button size="lg">Large</Button>
 * <Button size="xl">Extra Large</Button>
 *
 * // With icons
 * <Button leftIcon="add">Add Item</Button>
 * <Button rightIcon="arrow-forward">Continue</Button>
 * <Button icon="settings" /> // Icon-only button
 *
 * // States
 * <Button loading>Saving...</Button>
 * <Button disabled>Disabled</Button>
 */

import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  Animated,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsDark } from '@/hooks/use-theme-color';

// ===========================================
// TYPES
// ===========================================

export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps {
  children?: React.ReactNode;
  onPress?: () => void;
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  // Icons
  icon?: keyof typeof Ionicons.glyphMap;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  // Styling
  className?: string;
  textClassName?: string;
  style?: ViewStyle;
  // Accessibility
  testID?: string;
  accessibilityLabel?: string;
}

// ===========================================
// COLOR CONFIGURATIONS
// ===========================================

type ColorConfig = {
  solid: { bg: string; bgActive: string; text: string };
  soft: {
    bg: string;
    bgDark: string;
    bgActive: string;
    bgActiveDark: string;
    text: string;
    textDark: string;
  };
  outline: { border: string; bgActive: string; bgActiveDark: string; text: string };
  ghost: { bgActive: string; bgActiveDark: string; text: string };
};

const colorConfigs: Record<ButtonColor, ColorConfig> = {
  primary: {
    solid: { bg: 'bg-primary', bgActive: 'active:bg-primary-700', text: 'text-white' },
    soft: {
      bg: 'bg-primary-100',
      bgDark: 'dark:bg-primary-900/30',
      bgActive: 'active:bg-primary-200',
      bgActiveDark: 'dark:active:bg-primary-800/50',
      text: 'text-primary-700',
      textDark: 'dark:text-primary-300',
    },
    outline: {
      border: 'border-primary',
      bgActive: 'active:bg-primary-50',
      bgActiveDark: 'dark:active:bg-primary-900/20',
      text: 'text-primary',
    },
    ghost: {
      bgActive: 'active:bg-primary-100',
      bgActiveDark: 'dark:active:bg-primary-900/30',
      text: 'text-primary',
    },
  },
  secondary: {
    solid: { bg: 'bg-secondary-600', bgActive: 'active:bg-secondary-700', text: 'text-white' },
    soft: {
      bg: 'bg-secondary-100',
      bgDark: 'dark:bg-secondary-800',
      bgActive: 'active:bg-secondary-200',
      bgActiveDark: 'dark:active:bg-secondary-700',
      text: 'text-secondary-700',
      textDark: 'dark:text-secondary-200',
    },
    outline: {
      border: 'border-secondary-300 dark:border-secondary-600',
      bgActive: 'active:bg-secondary-100',
      bgActiveDark: 'dark:active:bg-secondary-800',
      text: 'text-secondary-700 dark:text-secondary-200',
    },
    ghost: {
      bgActive: 'active:bg-secondary-100',
      bgActiveDark: 'dark:active:bg-secondary-800',
      text: 'text-secondary-700 dark:text-secondary-200',
    },
  },
  accent: {
    solid: { bg: 'bg-accent', bgActive: 'active:bg-accent-700', text: 'text-white' },
    soft: {
      bg: 'bg-accent-100',
      bgDark: 'dark:bg-accent-900/30',
      bgActive: 'active:bg-accent-200',
      bgActiveDark: 'dark:active:bg-accent-800/50',
      text: 'text-accent-700',
      textDark: 'dark:text-accent-300',
    },
    outline: {
      border: 'border-accent',
      bgActive: 'active:bg-accent-50',
      bgActiveDark: 'dark:active:bg-accent-900/20',
      text: 'text-accent',
    },
    ghost: {
      bgActive: 'active:bg-accent-100',
      bgActiveDark: 'dark:active:bg-accent-900/30',
      text: 'text-accent',
    },
  },
  success: {
    solid: { bg: 'bg-success', bgActive: 'active:bg-success-dark', text: 'text-white' },
    soft: {
      bg: 'bg-success/10',
      bgDark: 'dark:bg-success/20',
      bgActive: 'active:bg-success/20',
      bgActiveDark: 'dark:active:bg-success/30',
      text: 'text-success-dark',
      textDark: 'dark:text-success-light',
    },
    outline: {
      border: 'border-success',
      bgActive: 'active:bg-success/10',
      bgActiveDark: 'dark:active:bg-success/20',
      text: 'text-success',
    },
    ghost: {
      bgActive: 'active:bg-success/10',
      bgActiveDark: 'dark:active:bg-success/20',
      text: 'text-success',
    },
  },
  warning: {
    solid: { bg: 'bg-warning', bgActive: 'active:bg-warning-dark', text: 'text-white' },
    soft: {
      bg: 'bg-warning/10',
      bgDark: 'dark:bg-warning/20',
      bgActive: 'active:bg-warning/20',
      bgActiveDark: 'dark:active:bg-warning/30',
      text: 'text-warning-dark',
      textDark: 'dark:text-warning-light',
    },
    outline: {
      border: 'border-warning',
      bgActive: 'active:bg-warning/10',
      bgActiveDark: 'dark:active:bg-warning/20',
      text: 'text-warning',
    },
    ghost: {
      bgActive: 'active:bg-warning/10',
      bgActiveDark: 'dark:active:bg-warning/20',
      text: 'text-warning',
    },
  },
  danger: {
    solid: { bg: 'bg-danger', bgActive: 'active:bg-danger-dark', text: 'text-white' },
    soft: {
      bg: 'bg-danger/10',
      bgDark: 'dark:bg-danger/20',
      bgActive: 'active:bg-danger/20',
      bgActiveDark: 'dark:active:bg-danger/30',
      text: 'text-danger-dark',
      textDark: 'dark:text-danger-light',
    },
    outline: {
      border: 'border-danger',
      bgActive: 'active:bg-danger/10',
      bgActiveDark: 'dark:active:bg-danger/20',
      text: 'text-danger',
    },
    ghost: {
      bgActive: 'active:bg-danger/10',
      bgActiveDark: 'dark:active:bg-danger/20',
      text: 'text-danger',
    },
  },
  info: {
    solid: { bg: 'bg-info', bgActive: 'active:bg-info-dark', text: 'text-white' },
    soft: {
      bg: 'bg-info/10',
      bgDark: 'dark:bg-info/20',
      bgActive: 'active:bg-info/20',
      bgActiveDark: 'dark:active:bg-info/30',
      text: 'text-info-dark',
      textDark: 'dark:text-info-light',
    },
    outline: {
      border: 'border-info',
      bgActive: 'active:bg-info/10',
      bgActiveDark: 'dark:active:bg-info/20',
      text: 'text-info',
    },
    ghost: {
      bgActive: 'active:bg-info/10',
      bgActiveDark: 'dark:active:bg-info/20',
      text: 'text-info',
    },
  },
};

// Icon colors for each variant/color combination
const iconColors: Record<ButtonColor, Record<ButtonVariant, { light: string; dark: string }>> = {
  primary: {
    solid: { light: '#ffffff', dark: '#ffffff' },
    soft: { light: '#0369a1', dark: '#7dd3fc' },
    outline: { light: '#0a7ea4', dark: '#0a7ea4' },
    ghost: { light: '#0a7ea4', dark: '#0a7ea4' },
  },
  secondary: {
    solid: { light: '#ffffff', dark: '#ffffff' },
    soft: { light: '#374151', dark: '#e5e7eb' },
    outline: { light: '#374151', dark: '#e5e7eb' },
    ghost: { light: '#374151', dark: '#e5e7eb' },
  },
  accent: {
    solid: { light: '#ffffff', dark: '#ffffff' },
    soft: { light: '#7c3aed', dark: '#d8b4fe' },
    outline: { light: '#8b5cf6', dark: '#8b5cf6' },
    ghost: { light: '#8b5cf6', dark: '#8b5cf6' },
  },
  success: {
    solid: { light: '#ffffff', dark: '#ffffff' },
    soft: { light: '#16a34a', dark: '#86efac' },
    outline: { light: '#22c55e', dark: '#22c55e' },
    ghost: { light: '#22c55e', dark: '#22c55e' },
  },
  warning: {
    solid: { light: '#ffffff', dark: '#ffffff' },
    soft: { light: '#d97706', dark: '#fcd34d' },
    outline: { light: '#f59e0b', dark: '#f59e0b' },
    ghost: { light: '#f59e0b', dark: '#f59e0b' },
  },
  danger: {
    solid: { light: '#ffffff', dark: '#ffffff' },
    soft: { light: '#dc2626', dark: '#fca5a5' },
    outline: { light: '#ef4444', dark: '#ef4444' },
    ghost: { light: '#ef4444', dark: '#ef4444' },
  },
  info: {
    solid: { light: '#ffffff', dark: '#ffffff' },
    soft: { light: '#2563eb', dark: '#93c5fd' },
    outline: { light: '#3b82f6', dark: '#3b82f6' },
    ghost: { light: '#3b82f6', dark: '#3b82f6' },
  },
};

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

interface SizeConfig {
  container: string;
  text: string;
  iconSize: number;
  iconOnlySize: string;
  gap: number;
  paddingX: string;
}

const sizeConfigs: Record<ButtonSize, SizeConfig> = {
  xs: {
    container: 'h-8',
    text: 'text-xs font-medium',
    iconSize: 14,
    iconOnlySize: 'w-8 h-8',
    gap: 4,
    paddingX: 'px-3',
  },
  sm: {
    container: 'h-9',
    text: 'text-sm font-medium',
    iconSize: 16,
    iconOnlySize: 'w-9 h-9',
    gap: 6,
    paddingX: 'px-3.5',
  },
  md: {
    container: 'h-11',
    text: 'text-base font-semibold',
    iconSize: 18,
    iconOnlySize: 'w-11 h-11',
    gap: 8,
    paddingX: 'px-4',
  },
  lg: {
    container: 'h-[52px]',
    text: 'text-lg font-semibold',
    iconSize: 20,
    iconOnlySize: 'w-[52px] h-[52px]',
    gap: 8,
    paddingX: 'px-5',
  },
  xl: {
    container: 'h-[60px]',
    text: 'text-xl font-semibold',
    iconSize: 24,
    iconOnlySize: 'w-[60px] h-[60px]',
    gap: 10,
    paddingX: 'px-6',
  },
};

// ===========================================
// COMPONENT
// ===========================================

export function Button({
  children,
  onPress,
  color = 'primary',
  variant = 'solid',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  rounded = false,
  icon,
  leftIcon,
  rightIcon,
  className = '',
  textClassName = '',
  style,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const isDark = useIsDark();

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

  const colorConfig = colorConfigs[color];
  const sizeConfig = sizeConfigs[size];
  const isIconOnly = icon && !children;

  // Build container classes based on variant
  const getContainerClasses = (): string => {
    const baseClasses = [
      'items-center justify-center flex-row',
      rounded ? 'rounded-full' : 'rounded-lg',
      disabled ? 'opacity-40' : '',
      fullWidth ? 'w-full' : '',
    ];

    // Size classes
    if (isIconOnly) {
      baseClasses.push(sizeConfig.iconOnlySize);
    } else {
      baseClasses.push(sizeConfig.container, sizeConfig.paddingX);
    }

    // Variant-specific classes
    switch (variant) {
      case 'solid':
        baseClasses.push(colorConfig.solid.bg, colorConfig.solid.bgActive);
        break;
      case 'soft':
        baseClasses.push(
          colorConfig.soft.bg,
          colorConfig.soft.bgDark,
          colorConfig.soft.bgActive,
          colorConfig.soft.bgActiveDark
        );
        break;
      case 'outline':
        baseClasses.push(
          'border-[1.5px]',
          'bg-transparent',
          colorConfig.outline.border,
          colorConfig.outline.bgActive,
          colorConfig.outline.bgActiveDark
        );
        break;
      case 'ghost':
        baseClasses.push(
          'bg-transparent',
          colorConfig.ghost.bgActive,
          colorConfig.ghost.bgActiveDark
        );
        break;
    }

    return [...baseClasses, className].filter(Boolean).join(' ');
  };

  // Build text classes based on variant
  const getTextClasses = (): string => {
    const baseClasses = [sizeConfig.text];

    switch (variant) {
      case 'solid':
        baseClasses.push(colorConfig.solid.text);
        break;
      case 'soft':
        baseClasses.push(colorConfig.soft.text, colorConfig.soft.textDark);
        break;
      case 'outline':
        baseClasses.push(colorConfig.outline.text);
        break;
      case 'ghost':
        baseClasses.push(colorConfig.ghost.text);
        break;
    }

    return [...baseClasses, textClassName].filter(Boolean).join(' ');
  };

  // Get icon color
  const getIconColor = (): string => {
    if (disabled) return isDark ? '#9BA1A6' : '#687076';
    const colors = iconColors[color][variant];
    return isDark ? colors.dark : colors.light;
  };

  const iconColor = getIconColor();
  const containerClasses = getContainerClasses();
  const textClasses = getTextClasses();

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={iconColor} size="small" />;
    }

    // Icon-only button
    if (isIconOnly && icon) {
      return <Ionicons name={icon} size={sizeConfig.iconSize} color={iconColor} />;
    }

    return (
      <View className="flex-row items-center justify-center" style={{ gap: sizeConfig.gap }}>
        {leftIcon && <Ionicons name={leftIcon} size={sizeConfig.iconSize} color={iconColor} />}
        {children && <Text className={textClasses}>{children}</Text>}
        {rightIcon && <Ionicons name={rightIcon} size={sizeConfig.iconSize} color={iconColor} />}
      </View>
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        className={containerClasses}
        style={style}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * Icon Button - A button with only an icon
 */
export function IconButton(
  props: Omit<ButtonProps, 'children'> & { icon: keyof typeof Ionicons.glyphMap }
) {
  return <Button {...props} rounded />;
}

/**
 * Link Button - A ghost button styled like a link
 */
export function LinkButton(props: ButtonProps) {
  return <Button {...props} variant="ghost" />;
}
