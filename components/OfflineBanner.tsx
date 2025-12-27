/**
 * Offline Banner Component
 *
 * Displays a banner when the device is offline.
 * Automatically shows/hides based on network state.
 *
 * @example
 * ```tsx
 * import { OfflineBanner } from '@/components/OfflineBanner';
 *
 * function App() {
 *   return (
 *     <>
 *       <OfflineBanner />
 *       <MainContent />
 *     </>
 *   );
 * }
 * ```
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsOnline, useNetwork } from '@/lib/network';

interface OfflineBannerProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function OfflineBanner({
  message = 'You are offline',
  showRetry = true,
  onRetry,
}: OfflineBannerProps) {
  const isOnline = useIsOnline();
  const { refresh } = useNetwork();
  const insets = useSafeAreaInsets();

  if (isOnline) {
    return null;
  }

  const handleRetry = async () => {
    await refresh();
    onRetry?.();
  };

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(15)}
      exiting={SlideOutUp.springify().damping(15)}
      style={[styles.container, { paddingTop: insets.top + 8 }]}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={20} color="#ffffff" />
        <Text style={styles.message}>{message}</Text>
        {showRetry && (
          <Pressable
            onPress={handleRetry}
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * Minimal offline indicator (just an icon)
 */
export function OfflineIndicator() {
  const isOnline = useIsOnline();

  if (isOnline) {
    return null;
  }

  return (
    <Animated.View
      entering={SlideInUp.springify()}
      exiting={SlideOutUp.springify()}
      style={styles.indicator}
    >
      <Ionicons name="cloud-offline" size={16} color="#f59e0b" />
    </Animated.View>
  );
}

/**
 * Hook to show offline toast
 */
export function useOfflineToast() {
  const [wasOnline, setWasOnline] = React.useState(true);
  const isOnline = useIsOnline();

  React.useEffect(() => {
    if (!isOnline && wasOnline) {
      // Just went offline - could show a toast here
      console.log('[Network] Device went offline');
    } else if (isOnline && !wasOnline) {
      // Just came back online
      console.log('[Network] Device is back online');
    }
    setWasOnline(isOnline);
  }, [isOnline, wasOnline]);

  return { isOnline };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ef4444',
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  message: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  retryButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fef3c7',
    padding: 4,
    borderRadius: 12,
  },
});

export default OfflineBanner;
