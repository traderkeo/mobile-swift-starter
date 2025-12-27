/**
 * Card Component
 *
 * A versatile container component with multiple variants and composition pattern.
 *
 * @example
 * // Basic card
 * <Card>
 *   <Text>Card content</Text>
 * </Card>
 *
 * // Variants
 * <Card variant="elevated">Elevated card with shadow</Card>
 * <Card variant="outlined">Outlined card with border</Card>
 * <Card variant="filled">Filled background card</Card>
 * <Card variant="ghost">Transparent card</Card>
 *
 * // Composed card
 * <Card>
 *   <CardHeader
 *     title="Card Title"
 *     subtitle="Optional subtitle"
 *     action={<IconButton icon="ellipsis-horizontal" />}
 *   />
 *   <CardContent>
 *     <Text>Main content goes here</Text>
 *   </CardContent>
 *   <CardFooter>
 *     <Button variant="ghost">Cancel</Button>
 *     <Button>Confirm</Button>
 *   </CardFooter>
 * </Card>
 *
 * // Pressable card
 * <Card onPress={() => navigate('details')} pressable>
 *   <Text>Tap to view details</Text>
 * </Card>
 */

import React, { useRef, useCallback } from 'react';
import { View, TouchableOpacity, Text, Animated, type ViewStyle } from 'react-native';
import { useIsDark } from '@/hooks/use-theme-color';

// ===========================================
// TYPES
// ===========================================

export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost';
export type CardSize = 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  onPress?: () => void;
  pressable?: boolean;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  testID?: string;
}

// ===========================================
// VARIANT CONFIGURATIONS
// ===========================================

const variantClasses: Record<CardVariant, { light: string; dark: string }> = {
  elevated: {
    light: 'bg-white shadow-md',
    dark: 'bg-background-dark-secondary',
  },
  outlined: {
    light: 'bg-transparent border border-border',
    dark: 'bg-transparent border border-border-dark',
  },
  filled: {
    light: 'bg-background-secondary',
    dark: 'bg-background-dark-tertiary',
  },
  ghost: {
    light: 'bg-transparent',
    dark: 'bg-transparent',
  },
};

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

const sizeClasses: Record<CardSize, string> = {
  sm: 'p-3 rounded-lg',
  md: 'p-4 rounded-xl',
  lg: 'p-6 rounded-2xl',
};

// ===========================================
// MAIN CARD COMPONENT
// ===========================================

export function Card({
  children,
  variant = 'elevated',
  size = 'md',
  onPress,
  pressable = false,
  disabled = false,
  className = '',
  style,
  testID,
}: CardProps) {
  const isDark = useIsDark();

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

  const variantStyle = isDark ? variantClasses[variant].dark : variantClasses[variant].light;
  const sizeStyle = sizeClasses[size];

  const cardClasses = [
    'overflow-hidden',
    variantStyle,
    sizeStyle,
    disabled ? 'opacity-50' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Render as pressable if onPress is provided or pressable is true
  if (onPress || pressable) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          className={cardClasses}
          style={style}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
          testID={testID}
          accessibilityRole="button"
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View className={cardClasses} style={style} testID={testID}>
      {children}
    </View>
  );
}

// ===========================================
// CARD HEADER COMPONENT
// ===========================================

export interface CardHeaderProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, title, subtitle, action, className = '' }: CardHeaderProps) {
  // If children are provided, render them directly
  if (children) {
    return <View className={`mb-3 ${className}`}>{children}</View>;
  }

  // Otherwise render title/subtitle/action layout
  return (
    <View className={`flex-row items-start justify-between mb-3 ${className}`}>
      <View className="flex-1">
        {title && (
          <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
            {title}
          </Text>
        )}
        {subtitle && (
          <Text className="text-sm text-foreground-muted dark:text-foreground-dark-muted mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
      {action && <View className="ml-3">{action}</View>}
    </View>
  );
}

// ===========================================
// CARD CONTENT COMPONENT
// ===========================================

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <View className={className}>{children}</View>;
}

// ===========================================
// CARD FOOTER COMPONENT
// ===========================================

export interface CardFooterProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end' | 'between';
  className?: string;
}

const alignClasses: Record<NonNullable<CardFooterProps['align']>, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
};

export function CardFooter({ children, align = 'end', className = '' }: CardFooterProps) {
  return (
    <View
      className={`mt-4 pt-3 border-t border-border dark:border-border-dark flex-row items-center gap-2 ${alignClasses[align]} ${className}`}
    >
      {children}
    </View>
  );
}

// ===========================================
// CARD DIVIDER COMPONENT
// ===========================================

export interface CardDividerProps {
  className?: string;
}

export function CardDivider({ className = '' }: CardDividerProps) {
  return <View className={`my-3 h-px bg-border dark:bg-border-dark -mx-4 ${className}`} />;
}

// ===========================================
// CARD IMAGE COMPONENT
// ===========================================

export interface CardImageProps {
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

export function CardImage({ children, position = 'top', className = '' }: CardImageProps) {
  const positionClasses = position === 'top' ? '-mt-4 -mx-4 mb-4' : '-mb-4 -mx-4 mt-4';
  return <View className={`overflow-hidden ${positionClasses} ${className}`}>{children}</View>;
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * Info Card - A card styled for displaying information
 */
export interface InfoCardProps extends Omit<CardProps, 'variant'> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function InfoCard({ title, description, icon, children, ...props }: InfoCardProps) {
  return (
    <Card variant="filled" {...props}>
      <View className="flex-row items-start">
        {icon && <View className="mr-3">{icon}</View>}
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground dark:text-foreground-dark">
            {title}
          </Text>
          {description && (
            <Text className="text-sm text-foreground-muted dark:text-foreground-dark-muted mt-1">
              {description}
            </Text>
          )}
          {children}
        </View>
      </View>
    </Card>
  );
}

/**
 * Action Card - A card that looks pressable with visual feedback
 */
export function ActionCard(props: CardProps) {
  return <Card variant="elevated" pressable {...props} />;
}
