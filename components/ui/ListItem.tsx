/**
 * ListItem Component
 *
 * Versatile list item for settings, menus, navigation lists, and more.
 * Supports icons, badges, switches, chevrons, and multiple layouts.
 *
 * @example
 * // Basic list item
 * <ListItem
 *   title="Account Settings"
 *   leftIcon="person-outline"
 *   onPress={() => navigate('account')}
 * />
 *
 * // With description
 * <ListItem
 *   title="Notifications"
 *   description="Manage your notification preferences"
 *   leftIcon="notifications-outline"
 *   onPress={handlePress}
 * />
 *
 * // With badge
 * <ListItem
 *   title="Messages"
 *   leftIcon="mail-outline"
 *   badge={5}
 *   onPress={handlePress}
 * />
 *
 * // With switch (no chevron)
 * <ListItem
 *   title="Dark Mode"
 *   leftIcon="moon-outline"
 *   rightElement={<Switch value={darkMode} onValueChange={setDarkMode} />}
 * />
 *
 * // Destructive action
 * <ListItem
 *   title="Delete Account"
 *   leftIcon="trash-outline"
 *   variant="danger"
 *   onPress={handleDelete}
 * />
 *
 * // Grouped list
 * <ListGroup title="General" footer="Manage your account settings">
 *   <ListItem title="Profile" leftIcon="person" />
 *   <ListItem title="Security" leftIcon="shield" />
 * </ListGroup>
 */

import React, { useRef, useCallback } from 'react';
import { View, TouchableOpacity, Animated, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Text } from './Text';

// Local color constants for list item variants (match tailwind.config.js)
const LIST_COLORS = {
  primary: '#0a7ea4',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
};

// ===========================================
// TYPES
// ===========================================

export type ListItemVariant = 'default' | 'danger' | 'success' | 'warning';
export type ListItemSize = 'sm' | 'md' | 'lg';

export interface ListItemProps {
  /** Primary text */
  title: string;
  /** Secondary text below title */
  description?: string;
  /** Text on the right side (e.g., value, status) */
  rightText?: string;
  /** Left icon name */
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Custom left element (overrides leftIcon) */
  leftElement?: React.ReactNode;
  /** Right icon name (defaults to chevron if onPress provided) */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  /** Custom right element (overrides rightIcon and badge) */
  rightElement?: React.ReactNode;
  /** Badge count or text */
  badge?: number | string;
  /** Visual variant */
  variant?: ListItemVariant;
  /** Size variant */
  size?: ListItemSize;
  /** Press handler */
  onPress?: () => void;
  /** Whether to show chevron (auto if onPress provided) */
  showChevron?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Show bottom border */
  bordered?: boolean;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: ViewStyle;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

interface SizeConfig {
  padding: string;
  iconSize: number;
  iconContainerSize: number;
  titleSize: 'sm' | 'base' | 'lg';
  descSize: 'xs' | 'sm' | 'base';
}

const sizeConfigs: Record<ListItemSize, SizeConfig> = {
  sm: {
    padding: 'py-2.5 px-4',
    iconSize: 18,
    iconContainerSize: 32,
    titleSize: 'sm',
    descSize: 'xs',
  },
  md: {
    padding: 'py-3.5 px-4',
    iconSize: 22,
    iconContainerSize: 40,
    titleSize: 'base',
    descSize: 'sm',
  },
  lg: {
    padding: 'py-4 px-4',
    iconSize: 24,
    iconContainerSize: 48,
    titleSize: 'lg',
    descSize: 'base',
  },
};

// ===========================================
// COMPONENT
// ===========================================

export function ListItem({
  title,
  description,
  rightText,
  leftIcon,
  leftElement,
  rightIcon,
  rightElement,
  badge,
  variant = 'default',
  size = 'md',
  onPress,
  showChevron,
  disabled = false,
  bordered = true,
  className = '',
  style,
}: ListItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfigs[size];

  // Animation for press feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  // Determine colors based on variant
  const getIconColor = () => {
    if (disabled) return isDark ? '#4B5563' : '#9CA3AF';
    switch (variant) {
      case 'danger':
        return LIST_COLORS.danger;
      case 'success':
        return LIST_COLORS.success;
      case 'warning':
        return LIST_COLORS.warning;
      default:
        return isDark ? '#9CA3AF' : '#6B7280';
    }
  };

  const getTitleColor = (): 'default' | 'danger' | 'success' | 'warning' | 'muted' => {
    if (disabled) return 'muted';
    if (variant === 'danger') return 'danger';
    if (variant === 'success') return 'success';
    if (variant === 'warning') return 'warning';
    return 'default';
  };

  // Should show chevron?
  const displayChevron = showChevron ?? (onPress && !rightElement);

  const content = (
    <View
      className={`flex-row items-center ${config.padding} ${
        bordered ? 'border-b border-border dark:border-border-dark' : ''
      } ${className}`}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      {/* Left Icon/Element */}
      {(leftIcon || leftElement) && (
        <View className="mr-3">
          {leftElement || (
            <View
              className="items-center justify-center rounded-lg"
              style={{
                width: config.iconContainerSize,
                height: config.iconContainerSize,
                backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
              }}
            >
              <Ionicons name={leftIcon!} size={config.iconSize} color={getIconColor()} />
            </View>
          )}
        </View>
      )}

      {/* Content */}
      <View className="flex-1 justify-center">
        <Text size={config.titleSize} weight="medium" color={getTitleColor()}>
          {title}
        </Text>
        {description && (
          <Text size={config.descSize} color="muted" className="mt-0.5">
            {description}
          </Text>
        )}
      </View>

      {/* Right Side */}
      <View className="flex-row items-center ml-2">
        {/* Right text */}
        {rightText && !rightElement && (
          <Text size="sm" color="muted" className="mr-2">
            {rightText}
          </Text>
        )}

        {/* Badge */}
        {badge !== undefined && !rightElement && (
          <View
            className="px-2.5 py-0.5 rounded-full mr-2"
            style={{
              backgroundColor: variant === 'danger' ? LIST_COLORS.danger : LIST_COLORS.primary,
            }}
          >
            <Text size="xs" weight="semibold" color="white">
              {typeof badge === 'number' && badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}

        {/* Custom right element */}
        {rightElement}

        {/* Right icon or chevron */}
        {!rightElement && (rightIcon || displayChevron) && (
          <Ionicons
            name={rightIcon || 'chevron-forward'}
            size={20}
            color={isDark ? '#4B5563' : '#9CA3AF'}
          />
        )}
      </View>
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
          className={`${isDark ? 'active:bg-gray-800' : 'active:bg-gray-50'}`}
        >
          {content}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return content;
}

// ===========================================
// LIST GROUP COMPONENT
// ===========================================

export interface ListGroupProps {
  children: React.ReactNode;
  /** Group title */
  title?: string;
  /** Footer text */
  footer?: string;
  /** Inset style (rounded with margin) */
  inset?: boolean;
  /** Custom className */
  className?: string;
}

export function ListGroup({
  children,
  title,
  footer,
  inset = false,
  className = '',
}: ListGroupProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={className}>
      {title && (
        <Text
          size="sm"
          color="muted"
          weight="medium"
          className={`mb-2 ${inset ? 'px-4' : 'px-4'} uppercase tracking-wider`}
        >
          {title}
        </Text>
      )}
      <View
        className={`overflow-hidden ${
          inset
            ? `mx-4 rounded-xl ${isDark ? 'bg-background-dark-secondary' : 'bg-white'}`
            : isDark
              ? 'bg-background-dark-secondary'
              : 'bg-white'
        }`}
      >
        {children}
      </View>
      {footer && (
        <Text size="xs" color="muted" className={`mt-2 ${inset ? 'px-4' : 'px-4'}`}>
          {footer}
        </Text>
      )}
    </View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * SettingsItem - Styled for settings screens
 */
export function SettingsItem(props: ListItemProps) {
  return <ListItem size="md" {...props} />;
}

/**
 * MenuOption - Styled for action menus
 */
export function MenuOption(props: ListItemProps) {
  return <ListItem size="md" bordered={false} {...props} />;
}

/**
 * NavigationItem - Styled for navigation lists
 */
export function NavigationItem(props: ListItemProps) {
  return <ListItem size="lg" showChevron {...props} />;
}
