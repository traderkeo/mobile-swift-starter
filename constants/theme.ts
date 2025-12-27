/**
 * Centralized Design Tokens and Theme Configuration
 *
 * This file contains all design tokens used throughout the app.
 * Edit these values to customize the look and feel of your app.
 *
 * Usage:
 * ```tsx
 * import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
 *
 * // Use colors
 * const backgroundColor = Colors.light.background;
 *
 * // Use with theme hook
 * const { colors } = useTheme();
 * ```
 */

import { Platform } from 'react-native';

// ===========================================
// 🎨 SEMANTIC COLORS
// ===========================================

export const SemanticColors = {
  // Brand Colors
  primary: {
    DEFAULT: '#0a7ea4',
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0a7ea4',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  secondary: {
    DEFAULT: '#6b7280',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  accent: {
    DEFAULT: '#8b5cf6',
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#8b5cf6',
    700: '#7c3aed',
    800: '#6d28d9',
    900: '#5b21b6',
    950: '#2e1065',
  },
  // Status Colors
  success: {
    DEFAULT: '#22c55e',
    light: '#86efac',
    dark: '#16a34a',
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    DEFAULT: '#f59e0b',
    light: '#fcd34d',
    dark: '#d97706',
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  danger: {
    DEFAULT: '#ef4444',
    light: '#fca5a5',
    dark: '#dc2626',
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  info: {
    DEFAULT: '#3b82f6',
    light: '#93c5fd',
    dark: '#2563eb',
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
} as const;

// ===========================================
// 🌓 LIGHT/DARK MODE COLORS
// ===========================================

export const Colors = {
  light: {
    // Base
    text: '#11181C',
    textMuted: '#687076',
    textSubtle: '#9BA1A6',
    background: '#ffffff',
    backgroundSecondary: '#f5f5f5',
    backgroundTertiary: '#e5e5e5',
    // UI Elements
    tint: '#0a7ea4',
    icon: '#687076',
    border: '#e5e7eb',
    borderFocus: '#0a7ea4',
    // Tabs
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
    // Surfaces
    card: '#ffffff',
    cardElevated: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
    // Input
    inputBackground: '#ffffff',
    inputBorder: '#e5e7eb',
    inputPlaceholder: '#9BA1A6',
    // Divider
    divider: '#e5e7eb',
  },
  dark: {
    // Base
    text: '#ECEDEE',
    textMuted: '#9BA1A6',
    textSubtle: '#687076',
    background: '#151718',
    backgroundSecondary: '#1a1a1a',
    backgroundTertiary: '#2a2a2a',
    // UI Elements
    tint: '#ffffff',
    icon: '#9BA1A6',
    border: '#374151',
    borderFocus: '#0a7ea4',
    // Tabs
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#ffffff',
    // Surfaces
    card: '#1a1a1a',
    cardElevated: '#1f1f1f',
    overlay: 'rgba(0, 0, 0, 0.7)',
    // Input
    inputBackground: '#1a1a1a',
    inputBorder: '#374151',
    inputPlaceholder: '#687076',
    // Divider
    divider: '#374151',
  },
} as const;

// ===========================================
// 📐 SPACING SCALE
// ===========================================

export const Spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

// ===========================================
// 🔤 TYPOGRAPHY
// ===========================================

export const Typography = {
  // Font Sizes
  size: {
    xxs: 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  // Font Weights (as string for React Native)
  weight: {
    thin: '100' as const,
    extralight: '200' as const,
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  // Letter Spacing
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },
} as const;

// ===========================================
// 🔵 BORDER RADIUS
// ===========================================

export const Radius = {
  none: 0,
  sm: 6,
  DEFAULT: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// ===========================================
// 🎯 COMPONENT SIZES
// ===========================================

export const ComponentSizes = {
  // Button Heights
  button: {
    xs: 32,
    sm: 36,
    md: 44,
    lg: 52,
    xl: 60,
  },
  // Input Heights
  input: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  // Avatar Sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 80,
  },
  // Icon Sizes
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
  // Badge Sizes
  badge: {
    sm: 20,
    md: 24,
    lg: 28,
  },
} as const;

// ===========================================
// 🌫️ SHADOWS
// ===========================================

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  DEFAULT: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
} as const;

// ===========================================
// ⏱️ ANIMATION DURATIONS
// ===========================================

export const Animation = {
  duration: {
    fastest: 50,
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 500,
    slowest: 1000,
  },
  easing: {
    linear: 'linear' as const,
    easeIn: 'ease-in' as const,
    easeOut: 'ease-out' as const,
    easeInOut: 'ease-in-out' as const,
  },
} as const;

// ===========================================
// 🖋️ PLATFORM-SPECIFIC FONTS
// ===========================================

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Menlo',
    rounded: 'System',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    mono: 'monospace',
    rounded: 'Roboto',
  },
  default: {
    sans: 'System',
    serif: 'serif',
    mono: 'monospace',
    rounded: 'System',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif",
  },
});

// ===========================================
// 🎨 THEME VARIANTS (for components)
// ===========================================

export type ColorVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StyleVariant = 'solid' | 'soft' | 'outline' | 'ghost';

/**
 * Get color value by variant name
 */
export function getColorByVariant(
  variant: ColorVariant,
  shade: 'DEFAULT' | 'light' | 'dark' | '50' | '100' | '500' | '600' | '700' = 'DEFAULT'
): string {
  const color = SemanticColors[variant];
  return (color as Record<string, string>)[shade] || color.DEFAULT;
}

/**
 * Get contrasting text color for a background
 */
export function getContrastText(variant: ColorVariant, style: StyleVariant): string {
  if (style === 'solid') {
    return '#ffffff';
  }
  return getColorByVariant(variant, '700');
}

// ===========================================
// 📦 DEFAULT EXPORT
// ===========================================

export const theme = {
  colors: Colors,
  semantic: SemanticColors,
  spacing: Spacing,
  typography: Typography,
  radius: Radius,
  shadows: Shadows,
  animation: Animation,
  fonts: Fonts,
  componentSizes: ComponentSizes,
} as const;

export default theme;
