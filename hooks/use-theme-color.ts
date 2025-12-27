/**
 * Theme Color Hooks
 *
 * Hooks for accessing theme colors in a type-safe way.
 *
 * @example
 * // Get a specific theme color
 * const { colors, isDark } = useTheme();
 * const backgroundColor = colors.background;
 *
 * // Get a color with light/dark override
 * const color = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
 *
 * // Get semantic color by variant
 * const primaryColor = useSemanticColor('primary');
 * const dangerColor = useSemanticColor('danger', '500');
 */

import { useMemo } from 'react';
import { Colors, SemanticColors, type ColorVariant } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ===========================================
// useThemeColor - Get specific theme color
// ===========================================

/**
 * Get a theme color with optional light/dark overrides
 *
 * @param props - Optional light and dark color overrides
 * @param colorName - The name of the color from the Colors config
 * @returns The resolved color value
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
): string {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

// ===========================================
// useTheme - Get full theme context
// ===========================================

export interface ThemeContext {
  /** Current color scheme */
  colorScheme: 'light' | 'dark';
  /** Whether dark mode is active */
  isDark: boolean;
  /** All theme colors for current mode */
  colors: typeof Colors.light | typeof Colors.dark;
  /** Semantic colors (brand, status) */
  semantic: typeof SemanticColors;
}

/**
 * Get the full theme context including colors and dark mode state
 *
 * @returns Theme context with colors and state
 */
export function useTheme(): ThemeContext {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return useMemo(
    () => ({
      colorScheme,
      isDark,
      colors: Colors[colorScheme],
      semantic: SemanticColors,
    }),
    [colorScheme, isDark]
  );
}

// ===========================================
// useSemanticColor - Get semantic color by variant
// ===========================================

type SemanticShade =
  | 'DEFAULT'
  | 'light'
  | 'dark'
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950';

/**
 * Get a semantic color value by variant and shade
 *
 * @param variant - The color variant (primary, success, danger, etc.)
 * @param shade - The shade to use (DEFAULT, light, dark, 50-950)
 * @returns The color value
 */
export function useSemanticColor(variant: ColorVariant, shade: SemanticShade = 'DEFAULT'): string {
  const color = SemanticColors[variant];
  return (color as Record<string, string>)[shade] ?? color.DEFAULT;
}

// ===========================================
// useThemedStyle - Get conditional styles
// ===========================================

/**
 * Get styles conditionally based on theme
 *
 * @param lightStyle - Style to use in light mode
 * @param darkStyle - Style to use in dark mode
 * @returns The appropriate style for current theme
 */
export function useThemedStyle<T>(lightStyle: T, darkStyle: T): T {
  const colorScheme = useColorScheme() ?? 'light';
  return colorScheme === 'dark' ? darkStyle : lightStyle;
}

// ===========================================
// useThemedValue - Get value based on theme
// ===========================================

/**
 * Get a value conditionally based on theme (generic version of useThemedStyle)
 *
 * @param light - Value for light mode
 * @param dark - Value for dark mode
 * @returns The appropriate value for current theme
 */
export function useThemedValue<T>(light: T, dark: T): T {
  const colorScheme = useColorScheme() ?? 'light';
  return colorScheme === 'dark' ? dark : light;
}

// ===========================================
// useIsDark - Simple dark mode check
// ===========================================

/**
 * Simple hook to check if dark mode is active
 * Use this instead of repeating `const isDark = colorScheme === 'dark'`
 *
 * @returns true if dark mode is active
 *
 * @example
 * const isDark = useIsDark();
 * const bgColor = isDark ? '#000' : '#fff';
 */
export function useIsDark(): boolean {
  const colorScheme = useColorScheme() ?? 'light';
  return colorScheme === 'dark';
}

// ===========================================
// Utility functions (non-hook)
// ===========================================

/**
 * Get contrast text color for a given background
 *
 * @param backgroundColor - The background color (hex)
 * @returns White or black depending on contrast
 */
export function getContrastColor(backgroundColor: string): string {
  // Remove # if present
  const hex = backgroundColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Adjust color opacity
 *
 * @param color - The base color (hex)
 * @param opacity - The opacity value (0-1)
 * @returns RGBA color string
 */
export function withOpacity(color: string, opacity: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
