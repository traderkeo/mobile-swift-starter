/**
 * StatCard Component
 *
 * Display metrics, KPIs, and statistics in dashboard-style cards.
 * Supports trends, icons, sparklines, and multiple layouts.
 *
 * @example
 * // Basic stat
 * <StatCard
 *   title="Total Revenue"
 *   value="$12,450"
 * />
 *
 * // With trend indicator
 * <StatCard
 *   title="Active Users"
 *   value="2,847"
 *   trend={{ value: 12.5, direction: 'up' }}
 * />
 *
 * // With icon
 * <StatCard
 *   title="Downloads"
 *   value="1.2M"
 *   icon="download-outline"
 *   color="success"
 * />
 *
 * // Compact variant
 * <StatCard
 *   title="Conversion"
 *   value="3.24%"
 *   variant="compact"
 * />
 *
 * // With comparison
 * <StatCard
 *   title="Orders"
 *   value="847"
 *   comparison="vs 742 last month"
 *   trend={{ value: 14.2, direction: 'up' }}
 * />
 *
 * // Stat grid
 * <StatGrid>
 *   <StatCard title="Revenue" value="$45K" />
 *   <StatCard title="Orders" value="1,234" />
 *   <StatCard title="Users" value="5.2K" />
 *   <StatCard title="Growth" value="12.4%" />
 * </StatGrid>
 */

import React, { useRef, useEffect } from 'react';
import { View, Animated, Easing, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Text } from './Text';

// Local color constants for stat card variants (match tailwind.config.js)
const STAT_COLORS: Record<string, string> = {
  primary: '#0a7ea4',
  secondary: '#6b7280',
  accent: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

// ===========================================
// TYPES
// ===========================================

export type StatCardVariant = 'default' | 'compact' | 'outlined' | 'filled';
export type StatCardColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface TrendIndicator {
  value: number;
  direction: 'up' | 'down' | 'neutral';
  label?: string;
}

export interface StatCardProps {
  /** Stat title/label */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Trend indicator */
  trend?: TrendIndicator;
  /** Comparison text */
  comparison?: string;
  /** Icon name */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Color scheme */
  color?: StatCardColor;
  /** Visual variant */
  variant?: StatCardVariant;
  /** Animate value on mount */
  animated?: boolean;
  /** Custom prefix (e.g., "$") */
  prefix?: string;
  /** Custom suffix (e.g., "%") */
  suffix?: string;
  /** Additional subtitle */
  subtitle?: string;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: ViewStyle;
}

// ===========================================
// COMPONENT
// ===========================================

export function StatCard({
  title,
  value,
  trend,
  comparison,
  icon,
  color = 'primary',
  variant = 'default',
  animated = true,
  prefix = '',
  suffix = '',
  subtitle,
  className = '',
  style,
}: StatCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colorValue = STAT_COLORS[color] || STAT_COLORS.primary;

  // Animation for value
  const scaleAnim = useRef(new Animated.Value(animated ? 0.8 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 100,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    }
  }, [animated, scaleAnim, opacityAnim]);

  // Trend colors
  const getTrendColor = (direction: TrendIndicator['direction']) => {
    switch (direction) {
      case 'up':
        return STAT_COLORS.success;
      case 'down':
        return STAT_COLORS.danger;
      default:
        return isDark ? '#9CA3AF' : '#6B7280';
    }
  };

  const getTrendIcon = (direction: TrendIndicator['direction']): keyof typeof Ionicons.glyphMap => {
    switch (direction) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  // Variant styles
  const getContainerStyle = () => {
    const base = 'rounded-xl overflow-hidden';
    switch (variant) {
      case 'compact':
        return `${base} p-3`;
      case 'outlined':
        return `${base} p-4 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`;
      case 'filled':
        return `${base} p-4`;
      default:
        return `${base} p-4`;
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'filled':
        return `${colorValue}15`;
      case 'outlined':
        return 'transparent';
      default:
        return isDark ? '#1F2937' : '#FFFFFF';
    }
  };

  const isCompact = variant === 'compact';

  return (
    <View
      className={`${getContainerStyle()} ${className}`}
      style={[
        {
          backgroundColor: getBackgroundColor(),
          shadowColor: variant === 'default' ? '#000' : 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: variant === 'default' ? 4 : 0,
        },
        style,
      ]}
    >
      {/* Header row */}
      <View className={`flex-row items-center justify-between ${isCompact ? 'mb-1.5' : 'mb-3'}`}>
        <Text size={isCompact ? 'xs' : 'sm'} color="muted" weight="medium">
          {title}
        </Text>
        {icon && (
          <View
            className="items-center justify-center rounded-lg"
            style={{
              width: isCompact ? 28 : 36,
              height: isCompact ? 28 : 36,
              backgroundColor: `${colorValue}20`,
            }}
          >
            <Ionicons name={icon} size={isCompact ? 14 : 18} color={colorValue} />
          </View>
        )}
      </View>

      {/* Value */}
      <Animated.View
        style={{
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Text size={isCompact ? 'xl' : '3xl'} weight="bold" className={isCompact ? '' : 'mb-1'}>
          {prefix}
          {value}
          {suffix}
        </Text>
      </Animated.View>

      {/* Subtitle */}
      {subtitle && (
        <Text size="xs" color="muted" className="mt-0.5">
          {subtitle}
        </Text>
      )}

      {/* Trend and comparison row */}
      {(trend || comparison) && (
        <View className={`flex-row items-center ${isCompact ? 'mt-1.5' : 'mt-2'}`}>
          {trend && (
            <View className="flex-row items-center">
              <Ionicons
                name={getTrendIcon(trend.direction)}
                size={isCompact ? 14 : 16}
                color={getTrendColor(trend.direction)}
              />
              <Text
                size={isCompact ? 'xs' : 'sm'}
                weight="semibold"
                style={{ color: getTrendColor(trend.direction) }}
                className="ml-1"
              >
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </Text>
              {trend.label && (
                <Text size={isCompact ? 'xs' : 'sm'} color="muted" className="ml-1">
                  {trend.label}
                </Text>
              )}
            </View>
          )}
          {comparison && (
            <Text size={isCompact ? 'xs' : 'sm'} color="muted" className={trend ? 'ml-2' : ''}>
              {comparison}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// ===========================================
// STAT GRID COMPONENT
// ===========================================

export interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  gap?: number;
  className?: string;
}

export function StatGrid({ children, columns = 2, gap = 12, className = '' }: StatGridProps) {
  return (
    <View className={`flex-row flex-wrap ${className}`} style={{ margin: -gap / 2 }}>
      {React.Children.map(children, (child) => (
        <View
          style={{
            width: `${100 / columns}%`,
            padding: gap / 2,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * MetricCard - Alias for StatCard with filled variant
 */
export function MetricCard(props: StatCardProps) {
  return <StatCard variant="filled" {...props} />;
}

/**
 * KPICard - Stat card optimized for KPI display
 */
export interface KPICardProps extends Omit<StatCardProps, 'variant'> {
  target?: number;
  current?: number;
}

export function KPICard({ target, current, ...props }: KPICardProps) {
  const progress = target && current ? Math.round((current / target) * 100) : undefined;

  return (
    <StatCard {...props} subtitle={progress !== undefined ? `${progress}% of target` : undefined} />
  );
}

/**
 * MiniStat - Very compact inline stat
 */
export interface MiniStatProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MiniStat({ label, value, trend, className = '' }: MiniStatProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return STAT_COLORS.success;
      case 'down':
        return STAT_COLORS.danger;
      default:
        return isDark ? '#9CA3AF' : '#6B7280';
    }
  };

  return (
    <View className={`flex-row items-center ${className}`}>
      <Text size="sm" color="muted" className="mr-2">
        {label}:
      </Text>
      <Text size="sm" weight="semibold" style={trend ? { color: getTrendColor() } : undefined}>
        {value}
      </Text>
      {trend && trend !== 'neutral' && (
        <Ionicons
          name={trend === 'up' ? 'caret-up' : 'caret-down'}
          size={12}
          color={getTrendColor()}
          style={{ marginLeft: 2 }}
        />
      )}
    </View>
  );
}
