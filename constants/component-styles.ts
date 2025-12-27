/**
 * Centralized Component Style Configurations
 *
 * Shared style configurations for UI components to ensure consistency
 * and reduce duplication. Edit these to change component appearance globally.
 *
 * @example
 * import { buttonColors, buttonSizes, iconColors } from '@/constants/component-styles';
 */

// ===========================================
// COLOR CONFIGURATIONS
// ===========================================

export type ComponentColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type ComponentVariant = 'solid' | 'soft' | 'outline' | 'ghost';
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Icon colors for each color/variant combination
 * Used by Button, IconButton, and other icon-containing components
 */
export const iconColors: Record<
  ComponentColor,
  Record<ComponentVariant, { light: string; dark: string }>
> = {
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

/**
 * Get icon color for a component
 */
export function getIconColor(
  color: ComponentColor,
  variant: ComponentVariant,
  isDark: boolean,
  disabled?: boolean
): string {
  if (disabled) {
    return isDark ? '#9BA1A6' : '#687076';
  }
  const colors = iconColors[color][variant];
  return isDark ? colors.dark : colors.light;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

export interface SizeConfig {
  height: string;
  padding: string;
  fontSize: string;
  iconSize: number;
  gap: number;
}

/**
 * Standard size configurations for buttons and similar components
 */
export const componentSizes: Record<ComponentSize, SizeConfig> = {
  xs: {
    height: 'h-8',
    padding: 'px-3',
    fontSize: 'text-xs',
    iconSize: 14,
    gap: 4,
  },
  sm: {
    height: 'h-9',
    padding: 'px-3.5',
    fontSize: 'text-sm',
    iconSize: 16,
    gap: 6,
  },
  md: {
    height: 'h-11',
    padding: 'px-4',
    fontSize: 'text-base',
    iconSize: 18,
    gap: 8,
  },
  lg: {
    height: 'h-[52px]',
    padding: 'px-5',
    fontSize: 'text-lg',
    iconSize: 20,
    gap: 8,
  },
  xl: {
    height: 'h-[60px]',
    padding: 'px-6',
    fontSize: 'text-xl',
    iconSize: 24,
    gap: 10,
  },
};

/**
 * Icon-only button sizes
 */
export const iconButtonSizes: Record<ComponentSize, string> = {
  xs: 'w-8 h-8',
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-[52px] h-[52px]',
  xl: 'w-[60px] h-[60px]',
};

// ===========================================
// INPUT SIZE CONFIGURATIONS
// ===========================================

export interface InputSizeConfig {
  height: string;
  padding: string;
  fontSize: string;
  labelSize: string;
  iconSize: number;
  iconPadding: number;
}

export const inputSizes: Record<'sm' | 'md' | 'lg', InputSizeConfig> = {
  sm: {
    height: 'h-9',
    padding: 'px-3',
    fontSize: 'text-sm',
    labelSize: 'text-xs',
    iconSize: 16,
    iconPadding: 36,
  },
  md: {
    height: 'h-11',
    padding: 'px-4',
    fontSize: 'text-base',
    labelSize: 'text-sm',
    iconSize: 18,
    iconPadding: 44,
  },
  lg: {
    height: 'h-14',
    padding: 'px-4',
    fontSize: 'text-lg',
    labelSize: 'text-sm',
    iconSize: 20,
    iconPadding: 48,
  },
};

// ===========================================
// CARD SIZE CONFIGURATIONS
// ===========================================

export const cardSizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'p-3 rounded-lg',
  md: 'p-4 rounded-xl',
  lg: 'p-6 rounded-2xl',
};

// ===========================================
// BADGE SIZE CONFIGURATIONS
// ===========================================

export const badgeSizes: Record<
  'sm' | 'md' | 'lg',
  { height: string; padding: string; fontSize: string }
> = {
  sm: { height: 'h-5', padding: 'px-1.5', fontSize: 'text-xxs' },
  md: { height: 'h-6', padding: 'px-2', fontSize: 'text-xs' },
  lg: { height: 'h-7', padding: 'px-2.5', fontSize: 'text-sm' },
};

// ===========================================
// AVATAR SIZE CONFIGURATIONS
// ===========================================

export const avatarSizes: Record<
  ComponentSize | '2xl',
  { size: string; fontSize: string; iconSize: number }
> = {
  xs: { size: 'w-6 h-6', fontSize: 'text-xxs', iconSize: 12 },
  sm: { size: 'w-8 h-8', fontSize: 'text-xs', iconSize: 14 },
  md: { size: 'w-10 h-10', fontSize: 'text-sm', iconSize: 16 },
  lg: { size: 'w-12 h-12', fontSize: 'text-base', iconSize: 20 },
  xl: { size: 'w-16 h-16', fontSize: 'text-lg', iconSize: 24 },
  '2xl': { size: 'w-20 h-20', fontSize: 'text-xl', iconSize: 32 },
};

// ===========================================
// ANIMATION CONFIGURATIONS
// ===========================================

export const pressAnimationConfig = {
  scale: {
    button: 0.96,
    card: 0.98,
    icon: 0.9,
  },
  spring: {
    speed: 50,
    bounciness: {
      in: 4,
      out: 8,
    },
  },
};

// ===========================================
// DISABLED STATE
// ===========================================

export const disabledOpacity = 'opacity-40';
export const disabledTextColors = {
  light: '#687076',
  dark: '#9BA1A6',
};
