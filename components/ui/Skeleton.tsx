/**
 * Skeleton/Shimmer Loading Component
 *
 * A shimmer loading effect for content placeholders.
 * Use instead of spinners for a more polished loading experience.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SkeletonProps {
  /** Width of the skeleton (number for pixels, string for percentage) */
  width?: number | string;
  /** Height of the skeleton */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Additional style */
  style?: ViewStyle;
  /** Whether to show the shimmer animation */
  animated?: boolean;
}

/**
 * Base Skeleton component with shimmer animation
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  animated = true,
}: SkeletonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animated, shimmerAnim]);

  const backgroundColor = isDark ? '#374151' : '#E5E7EB';
  const shimmerColor = isDark ? '#4B5563' : '#F3F4F6';

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as number | `${number}%` | 'auto',
          height,
          borderRadius,
          backgroundColor,
          opacity: animated ? opacity : 0.7,
        },
        style,
      ]}
    />
  );
}

/**
 * Text line skeleton
 */
export function SkeletonText({
  lines = 1,
  lineHeight = 16,
  spacing = 8,
  lastLineWidth = '60%',
}: {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  lastLineWidth?: number | string;
}) {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
          borderRadius={4}
        />
      ))}
    </View>
  );
}

/**
 * Circle skeleton for avatars
 */
export function SkeletonCircle({ size = 48 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

/**
 * Card skeleton placeholder
 */
export function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <View style={styles.card}>
      <Skeleton height={height} borderRadius={12} />
    </View>
  );
}

/**
 * Product card skeleton for paywall
 */
export function SkeletonProductCard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.productCard,
        {
          backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
          borderColor: isDark ? '#374151' : '#E5E7EB',
        },
      ]}
    >
      <View style={styles.productCardContent}>
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width={120} height={20} borderRadius={4} />
          <Skeleton width={80} height={14} borderRadius={4} />
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Skeleton width={60} height={22} borderRadius={4} />
          <Skeleton width={40} height={14} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

/**
 * Paywall loading skeleton
 */
export function PaywallSkeleton() {
  return (
    <View style={styles.paywallContainer}>
      {/* Header skeleton */}
      <View style={styles.headerSkeleton}>
        <SkeletonCircle size={64} />
        <View style={{ marginTop: 16, alignItems: 'center', gap: 8 }}>
          <Skeleton width={200} height={28} borderRadius={6} />
          <Skeleton width={160} height={16} borderRadius={4} />
        </View>
      </View>

      {/* Features skeleton */}
      <View style={styles.featuresSkeleton}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.featureRow}>
            <SkeletonCircle size={20} />
            <Skeleton width="80%" height={16} borderRadius={4} style={{ marginLeft: 12 }} />
          </View>
        ))}
      </View>

      {/* Product cards skeleton */}
      <View style={{ gap: 12 }}>
        <SkeletonProductCard />
        <SkeletonProductCard />
      </View>

      {/* Button skeleton */}
      <View style={{ marginTop: 24 }}>
        <Skeleton height={52} borderRadius={12} />
      </View>

      {/* Restore button skeleton */}
      <View style={{ marginTop: 16, alignItems: 'center' }}>
        <Skeleton width={140} height={16} borderRadius={4} />
      </View>
    </View>
  );
}

/**
 * Profile loading skeleton
 */
export function ProfileSkeleton() {
  return (
    <View style={styles.profileContainer}>
      {/* Avatar */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <SkeletonCircle size={80} />
        <View style={{ marginTop: 12, alignItems: 'center', gap: 8 }}>
          <Skeleton width={120} height={24} borderRadius={4} />
          <Skeleton width={180} height={14} borderRadius={4} />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.statItem}>
            <Skeleton width={40} height={28} borderRadius={4} />
            <Skeleton width={60} height={12} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Menu items */}
      <View style={{ gap: 12, marginTop: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.menuItem}>
            <SkeletonCircle size={40} />
            <View style={{ flex: 1, marginLeft: 12, gap: 4 }}>
              <Skeleton width="60%" height={16} borderRadius={4} />
              <Skeleton width="40%" height={12} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  productCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  productCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paywallContainer: {
    padding: 24,
    paddingTop: 60,
  },
  headerSkeleton: {
    alignItems: 'center',
    marginBottom: 32,
  },
  featuresSkeleton: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileContainer: {
    padding: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
});

export default Skeleton;
