/**
 * Loading Components
 *
 * A collection of loading state components with consistent theming.
 *
 * @example
 * // Full screen loading
 * <LoadingScreen message="Loading data..." />
 *
 * // Transparent overlay
 * <LoadingScreen transparent message="Saving..." />
 *
 * // Inline spinner with sizes
 * <Spinner size="sm" />
 * <Spinner size="md" />
 * <Spinner size="lg" />
 *
 * // Spinner with colors
 * <Spinner color="primary" />
 * <Spinner color="success" />
 *
 * // Skeleton loaders
 * <Skeleton width={200} height={20} />
 * <Skeleton width="100%" height={40} rounded />
 * <Skeleton circle size={48} />
 *
 * // Skeleton presets
 * <SkeletonText lines={3} />
 * <SkeletonCard />
 * <SkeletonList count={5} />
 * <SkeletonAvatar size="lg" />
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Animated,
  Easing,
  type ViewStyle,
  type DimensionValue,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ===========================================
// TYPES
// ===========================================

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor =
  | 'primary'
  | 'secondary'
  | 'white'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

// ===========================================
// SPINNER COMPONENT
// ===========================================

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const spinnerSizes: Record<SpinnerSize, 'small' | 'large'> = {
  xs: 'small',
  sm: 'small',
  md: 'small',
  lg: 'large',
  xl: 'large',
};

const spinnerScales: Record<SpinnerSize, number> = {
  xs: 0.6,
  sm: 0.8,
  md: 1,
  lg: 1.2,
  xl: 1.5,
};

const spinnerColors: Record<SpinnerColor, { light: string; dark: string }> = {
  primary: { light: '#0a7ea4', dark: '#0a7ea4' },
  secondary: { light: '#6b7280', dark: '#9ca3af' },
  white: { light: '#ffffff', dark: '#ffffff' },
  success: { light: '#22c55e', dark: '#22c55e' },
  warning: { light: '#f59e0b', dark: '#f59e0b' },
  danger: { light: '#ef4444', dark: '#ef4444' },
  info: { light: '#3b82f6', dark: '#3b82f6' },
};

export function Spinner({ size = 'md', color = 'primary', className = '' }: SpinnerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const spinnerColor = isDark ? spinnerColors[color].dark : spinnerColors[color].light;

  return (
    <View
      className={`justify-center items-center ${className}`}
      style={{ transform: [{ scale: spinnerScales[size] }] }}
    >
      <ActivityIndicator size={spinnerSizes[size]} color={spinnerColor} />
    </View>
  );
}

// ===========================================
// LOADING SCREEN COMPONENT
// ===========================================

interface LoadingScreenProps {
  message?: string;
  transparent?: boolean;
  spinnerColor?: SpinnerColor;
  className?: string;
}

export function LoadingScreen({
  message,
  transparent = false,
  spinnerColor = 'primary',
  className = '',
}: LoadingScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgClass = transparent ? 'bg-black/50' : isDark ? 'bg-background-dark' : 'bg-background';

  return (
    <View
      className={`absolute inset-0 justify-center items-center z-[9999] ${bgClass} ${className}`}
    >
      <View className="items-center gap-4">
        <Spinner size="lg" color={transparent ? 'white' : spinnerColor} />
        {message && (
          <Text
            className={`text-base text-center ${
              transparent ? 'text-white' : 'text-foreground-muted dark:text-foreground-dark-muted'
            }`}
          >
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}

// ===========================================
// SKELETON COMPONENT
// ===========================================

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  rounded?: boolean;
  circle?: boolean;
  size?: number; // For circle mode
  style?: ViewStyle;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  rounded = false,
  circle = false,
  size,
  style,
  className = '',
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  // Interpolate opacity for a smoother shimmer
  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.7, 0.4],
  });

  // Determine dimensions
  let finalWidth: DimensionValue = width;
  let finalHeight = height;
  let finalRadius = borderRadius;

  if (circle && size) {
    finalWidth = size;
    finalHeight = size;
    finalRadius = size / 2;
  } else if (rounded) {
    finalRadius = Math.min(height / 2, 9999);
  }

  // Base and shimmer colors for depth
  const baseColor = isDark ? '#1f2937' : '#e5e7eb';
  const shimmerColor = isDark ? '#374151' : '#f3f4f6';

  return (
    <View
      className={`overflow-hidden ${className}`}
      style={[
        {
          width: finalWidth,
          height: finalHeight,
          borderRadius: finalRadius,
          backgroundColor: baseColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: shimmerColor,
          opacity,
        }}
      />
    </View>
  );
}

// ===========================================
// SKELETON TEXT COMPONENT
// ===========================================

interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: DimensionValue;
  lineHeight?: number;
  spacing?: number;
  className?: string;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
  lineHeight = 14,
  spacing = 10,
  className = '',
}: SkeletonTextProps) {
  return (
    <View className={className} style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={lineHeight}
        />
      ))}
    </View>
  );
}

// ===========================================
// SKELETON CARD COMPONENT
// ===========================================

interface SkeletonCardProps {
  showImage?: boolean;
  imageHeight?: number;
  lines?: number;
  className?: string;
}

export function SkeletonCard({
  showImage = false,
  imageHeight = 160,
  lines = 3,
  className = '',
}: SkeletonCardProps) {
  return (
    <View
      className={`p-4 rounded-xl bg-background dark:bg-background-dark-secondary shadow-sm ${className}`}
    >
      {showImage && (
        <Skeleton
          width="100%"
          height={imageHeight}
          style={{ marginBottom: 16, marginLeft: -16, marginRight: -16, marginTop: -16 }}
          borderRadius={0}
        />
      )}
      <Skeleton width={120} height={16} style={{ marginBottom: 16 }} />
      <SkeletonText lines={lines} />
    </View>
  );
}

// ===========================================
// SKELETON LIST COMPONENT
// ===========================================

interface SkeletonListProps {
  count?: number;
  showAvatar?: boolean;
  avatarSize?: number;
  lines?: number;
  className?: string;
}

export function SkeletonList({
  count = 5,
  showAvatar = true,
  avatarSize = 48,
  lines = 2,
  className = '',
}: SkeletonListProps) {
  return (
    <View className={`gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="flex-row items-center gap-3">
          {showAvatar && <Skeleton circle size={avatarSize} />}
          <View className="flex-1 gap-2">
            <Skeleton width="60%" height={16} />
            {lines > 1 && <Skeleton width="40%" height={12} />}
            {lines > 2 && <Skeleton width="80%" height={12} />}
          </View>
        </View>
      ))}
    </View>
  );
}

// ===========================================
// SKELETON AVATAR COMPONENT
// ===========================================

interface SkeletonAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const avatarSizes: Record<NonNullable<SkeletonAvatarProps['size']>, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
};

export function SkeletonAvatar({ size = 'md', className = '' }: SkeletonAvatarProps) {
  return <Skeleton circle size={avatarSizes[size]} className={className} />;
}

// ===========================================
// SKELETON BUTTON COMPONENT
// ===========================================

interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

const buttonSizes: Record<
  NonNullable<SkeletonButtonProps['size']>,
  { height: number; width: number }
> = {
  sm: { height: 36, width: 80 },
  md: { height: 44, width: 100 },
  lg: { height: 52, width: 120 },
};

export function SkeletonButton({
  size = 'md',
  fullWidth = false,
  className = '',
}: SkeletonButtonProps) {
  const config = buttonSizes[size];
  return (
    <Skeleton
      width={fullWidth ? '100%' : config.width}
      height={config.height}
      rounded
      className={className}
    />
  );
}

// ===========================================
// INLINE LOADING COMPONENT
// ===========================================

interface InlineLoadingProps {
  text?: string;
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

export function InlineLoading({
  text = 'Loading...',
  size = 'sm',
  color = 'primary',
  className = '',
}: InlineLoadingProps) {
  return (
    <View className={`flex-row items-center gap-2 ${className}`}>
      <Spinner size={size} color={color} />
      <Text className="text-sm text-foreground-muted dark:text-foreground-dark-muted">{text}</Text>
    </View>
  );
}

// ===========================================
// LEGACY EXPORTS (for backward compatibility)
// ===========================================

export { Spinner as LoadingSpinner };
