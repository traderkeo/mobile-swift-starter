/**
 * Text Component
 *
 * A comprehensive text component with typography variants, sizes, colors, and weights.
 *
 * @example
 * // Basic usage
 * <Text>Default text</Text>
 *
 * // Sizes
 * <Text size="xs">Extra small</Text>
 * <Text size="sm">Small</Text>
 * <Text size="base">Base (default)</Text>
 * <Text size="lg">Large</Text>
 * <Text size="xl">Extra large</Text>
 * <Text size="2xl">2X large</Text>
 * <Text size="3xl">3X large</Text>
 *
 * // Weights
 * <Text weight="normal">Normal weight</Text>
 * <Text weight="medium">Medium weight</Text>
 * <Text weight="semibold">Semibold weight</Text>
 * <Text weight="bold">Bold weight</Text>
 *
 * // Colors
 * <Text color="primary">Primary color</Text>
 * <Text color="muted">Muted text</Text>
 * <Text color="success">Success text</Text>
 * <Text color="danger">Error text</Text>
 *
 * // Semantic variants (presets)
 * <Text variant="h1">Heading 1</Text>
 * <Text variant="h2">Heading 2</Text>
 * <Text variant="body">Body text</Text>
 * <Text variant="caption">Caption text</Text>
 * <Text variant="label">Label text</Text>
 *
 * // Alignment
 * <Text align="center">Centered text</Text>
 *
 * // Truncation
 * <Text numberOfLines={2} ellipsizeMode="tail">Long text...</Text>
 */

import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

// ===========================================
// TYPES
// ===========================================

export type TextSize = 'xxs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
export type TextWeight =
  | 'thin'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';
export type TextColor =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'white'
  | 'black';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodyLarge'
  | 'caption'
  | 'label'
  | 'overline';

export interface TextProps extends RNTextProps {
  children: React.ReactNode;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  align?: TextAlign;
  variant?: TextVariant;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
  className?: string;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

const sizeClasses: Record<TextSize, string> = {
  xxs: 'text-[10px] leading-[14px]',
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
};

// ===========================================
// WEIGHT CONFIGURATIONS
// ===========================================

const weightClasses: Record<TextWeight, string> = {
  thin: 'font-thin',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
};

// ===========================================
// COLOR CONFIGURATIONS
// ===========================================

const colorClasses: Record<TextColor, string> = {
  default: 'text-foreground dark:text-foreground-dark',
  muted: 'text-foreground-muted dark:text-foreground-dark-muted',
  subtle: 'text-foreground-subtle',
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  white: 'text-white',
  black: 'text-black',
};

// ===========================================
// ALIGNMENT CONFIGURATIONS
// ===========================================

const alignClasses: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

// ===========================================
// VARIANT PRESETS
// ===========================================

interface VariantPreset {
  size: TextSize;
  weight: TextWeight;
  color?: TextColor;
  extraClasses?: string;
}

const variantPresets: Record<TextVariant, VariantPreset> = {
  h1: { size: '4xl', weight: 'bold', extraClasses: 'tracking-tight' },
  h2: { size: '3xl', weight: 'bold', extraClasses: 'tracking-tight' },
  h3: { size: '2xl', weight: 'semibold' },
  h4: { size: 'xl', weight: 'semibold' },
  body: { size: 'base', weight: 'normal' },
  bodyLarge: { size: 'lg', weight: 'normal' },
  caption: { size: 'sm', weight: 'normal', color: 'muted' },
  label: { size: 'sm', weight: 'medium' },
  overline: { size: 'xs', weight: 'semibold', extraClasses: 'uppercase tracking-wider' },
};

// ===========================================
// COMPONENT
// ===========================================

export function Text({
  children,
  size,
  weight,
  color,
  align,
  variant,
  italic = false,
  underline = false,
  strikethrough = false,
  uppercase = false,
  lowercase = false,
  capitalize = false,
  className = '',
  ...props
}: TextProps) {
  // Get preset values if variant is specified
  const preset = variant ? variantPresets[variant] : null;

  // Determine final values (explicit props override preset)
  const finalSize = size ?? preset?.size ?? 'base';
  const finalWeight = weight ?? preset?.weight ?? 'normal';
  const finalColor = color ?? preset?.color ?? 'default';

  // Build class string
  const classes = [
    sizeClasses[finalSize],
    weightClasses[finalWeight],
    colorClasses[finalColor],
    align ? alignClasses[align] : '',
    preset?.extraClasses ?? '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    strikethrough ? 'line-through' : '',
    uppercase ? 'uppercase' : '',
    lowercase ? 'lowercase' : '',
    capitalize ? 'capitalize' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <RNText className={classes} {...props}>
      {children}
    </RNText>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * Heading components - Semantic heading variants
 */
export function H1(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h1" {...props} />;
}

export function H2(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h2" {...props} />;
}

export function H3(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h3" {...props} />;
}

export function H4(props: Omit<TextProps, 'variant'>) {
  return <Text variant="h4" {...props} />;
}

/**
 * Body text component
 */
export function Body(props: Omit<TextProps, 'variant'>) {
  return <Text variant="body" {...props} />;
}

/**
 * Caption text component - For small, supporting text
 */
export function Caption(props: Omit<TextProps, 'variant'>) {
  return <Text variant="caption" {...props} />;
}

/**
 * Label text component - For form labels
 */
export function Label(props: Omit<TextProps, 'variant'>) {
  return <Text variant="label" {...props} />;
}

/**
 * Overline text component - For category labels, section headers
 */
export function Overline(props: Omit<TextProps, 'variant'>) {
  return <Text variant="overline" {...props} />;
}

/**
 * Link text component - Styled like a link
 */
export interface LinkTextProps extends TextProps {
  onPress?: () => void;
}

export function LinkText({ onPress, ...props }: LinkTextProps) {
  return <Text color="primary" underline onPress={onPress} {...props} />;
}

/**
 * Error text component - For error messages
 */
export function ErrorText(props: Omit<TextProps, 'color' | 'size'>) {
  return <Text size="sm" color="danger" {...props} />;
}

/**
 * Success text component - For success messages
 */
export function SuccessText(props: Omit<TextProps, 'color' | 'size'>) {
  return <Text size="sm" color="success" {...props} />;
}
