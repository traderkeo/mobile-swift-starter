/**
 * EmptyState Component
 *
 * Display meaningful empty states with illustrations, messages, and actions.
 * Essential for lists, search results, and data-driven screens.
 *
 * @example
 * // Basic empty state
 * <EmptyState
 *   icon="folder-open-outline"
 *   title="No files yet"
 *   description="Upload your first file to get started"
 * />
 *
 * // With action button
 * <EmptyState
 *   icon="search-outline"
 *   title="No results found"
 *   description="Try adjusting your search or filters"
 *   actionLabel="Clear filters"
 *   onAction={handleClearFilters}
 * />
 *
 * // Compact variant for inline use
 * <EmptyState
 *   variant="compact"
 *   icon="chatbubble-outline"
 *   title="No messages"
 * />
 *
 * // Error state
 * <EmptyState
 *   variant="error"
 *   title="Something went wrong"
 *   description="We couldn't load your data"
 *   actionLabel="Try again"
 *   onAction={handleRetry}
 * />
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Text } from './Text';

// Local color constants for status indicators (match tailwind.config.js)
const STATUS_COLORS = {
  primary: '#0a7ea4',
  danger: '#ef4444',
  success: '#22c55e',
};

// ===========================================
// TYPES
// ===========================================

export type EmptyStateVariant = 'default' | 'compact' | 'error' | 'success';

export interface EmptyStateProps {
  /** Icon name from Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Custom icon element (overrides icon prop) */
  customIcon?: React.ReactNode;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button label */
  actionLabel?: string;
  /** Primary action callback */
  onAction?: () => void;
  /** Secondary action label */
  secondaryLabel?: string;
  /** Secondary action callback */
  onSecondaryAction?: () => void;
  /** Visual variant */
  variant?: EmptyStateVariant;
  /** Whether to animate the icon */
  animated?: boolean;
  /** Custom className */
  className?: string;
}

// ===========================================
// VARIANT CONFIGURATIONS
// ===========================================

interface VariantConfig {
  iconSize: number;
  iconBgSize: number;
  iconColor: string;
  bgColor: string;
  spacing: string;
}

const getVariantConfig = (variant: EmptyStateVariant, isDark: boolean): VariantConfig => {
  const configs: Record<EmptyStateVariant, VariantConfig> = {
    default: {
      iconSize: 48,
      iconBgSize: 96,
      iconColor: isDark ? '#9CA3AF' : '#6B7280',
      bgColor: isDark ? '#1F2937' : '#F3F4F6',
      spacing: 'py-12 px-6',
    },
    compact: {
      iconSize: 32,
      iconBgSize: 64,
      iconColor: isDark ? '#9CA3AF' : '#6B7280',
      bgColor: isDark ? '#1F2937' : '#F3F4F6',
      spacing: 'py-8 px-4',
    },
    error: {
      iconSize: 48,
      iconBgSize: 96,
      iconColor: STATUS_COLORS.danger,
      bgColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      spacing: 'py-12 px-6',
    },
    success: {
      iconSize: 48,
      iconBgSize: 96,
      iconColor: STATUS_COLORS.success,
      bgColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
      spacing: 'py-12 px-6',
    },
  };
  return configs[variant];
};

// ===========================================
// COMPONENT
// ===========================================

export function EmptyState({
  icon = 'folder-open-outline',
  customIcon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  variant = 'default',
  animated = true,
  className = '',
}: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = getVariantConfig(variant, isDark);

  // Gentle float animation for the icon
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      // Subtle floating effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -6,
            duration: 2000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, floatAnim]);

  // Button press animation
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

  return (
    <View className={`items-center justify-center ${config.spacing} ${className}`}>
      {/* Icon Container */}
      <Animated.View
        style={{
          transform: [{ translateY: animated ? floatAnim : 0 }],
        }}
      >
        <View
          style={{
            width: config.iconBgSize,
            height: config.iconBgSize,
            borderRadius: config.iconBgSize / 2,
            backgroundColor: config.bgColor,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          {customIcon || <Ionicons name={icon} size={config.iconSize} color={config.iconColor} />}
        </View>
      </Animated.View>

      {/* Text Content */}
      <Text
        size={variant === 'compact' ? 'base' : 'lg'}
        weight="semibold"
        align="center"
        className="mb-2"
      >
        {title}
      </Text>

      {description && (
        <Text
          size={variant === 'compact' ? 'sm' : 'base'}
          color="muted"
          align="center"
          className="max-w-[280px]"
        >
          {description}
        </Text>
      )}

      {/* Actions */}
      {(actionLabel || secondaryLabel) && (
        <View className="flex-row items-center gap-3 mt-6">
          {secondaryLabel && onSecondaryAction && (
            <TouchableOpacity
              onPress={onSecondaryAction}
              className={`px-5 py-2.5 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
              activeOpacity={0.7}
            >
              <Text weight="medium" color="muted">
                {secondaryLabel}
              </Text>
            </TouchableOpacity>
          )}

          {actionLabel && onAction && (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                onPress={onAction}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                className="px-5 py-2.5 rounded-lg"
                style={{
                  backgroundColor:
                    variant === 'error' ? STATUS_COLORS.danger : STATUS_COLORS.primary,
                }}
                activeOpacity={1}
              >
                <Text weight="semibold" color="white">
                  {actionLabel}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * NoResults - Empty state for search with no results
 */
export interface NoResultsProps {
  query?: string;
  onClear?: () => void;
  className?: string;
}

export function NoResults({ query, onClear, className }: NoResultsProps) {
  return (
    <EmptyState
      icon="search-outline"
      title="No results found"
      description={
        query
          ? `We couldn't find anything matching "${query}"`
          : 'Try adjusting your search or filters'
      }
      actionLabel={onClear ? 'Clear search' : undefined}
      onAction={onClear}
      className={className}
    />
  );
}

/**
 * NoData - Empty state for lists with no data
 */
export interface NoDataProps {
  title?: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function NoData({
  title = 'No data yet',
  description = "You'll see your data here once you get started",
  icon = 'folder-open-outline',
  actionLabel,
  onAction,
  className,
}: NoDataProps) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
    />
  );
}

/**
 * ErrorState - Empty state for errors
 */
export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      variant="error"
      icon="alert-circle-outline"
      title={title}
      description={description}
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
      className={className}
    />
  );
}

/**
 * OfflineState - Empty state for offline/no connection
 */
export interface OfflineStateProps {
  onRetry?: () => void;
  className?: string;
}

export function OfflineState({ onRetry, className }: OfflineStateProps) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="You're offline"
      description="Check your internet connection and try again"
      actionLabel={onRetry ? 'Retry' : undefined}
      onAction={onRetry}
      className={className}
    />
  );
}
