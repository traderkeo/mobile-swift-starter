/**
 * Rewarded Ad Button
 *
 * A button that shows a rewarded ad and delivers a reward.
 *
 * @example
 * ```tsx
 * <RewardedAdButton
 *   onReward={(reward) => addCoins(reward.amount)}
 *   rewardText="Watch ad for 100 coins"
 * />
 * ```
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useRewardedAd, useAds, type RewardedResult } from '@/lib/ads';
import { AD_PLACEMENTS } from '@/config/ads';

interface RewardedAdButtonProps {
  onReward: (reward: RewardedResult) => void;
  onError?: (error: Error) => void;
  placementId?: keyof typeof AD_PLACEMENTS;
  title?: string;
  rewardText?: string;
  disabled?: boolean;
  style?: object;
}

export function RewardedAdButton({
  onReward,
  onError,
  placementId = 'watchForCoins',
  title,
  rewardText,
  disabled = false,
  style,
}: RewardedAdButtonProps) {
  const { show, isLoaded, error } = useRewardedAd({ placementId });
  const { shouldShowAds } = useAds();
  const [isWatching, setIsWatching] = useState(false);

  const handlePress = useCallback(async () => {
    if (!isLoaded || isWatching) return;

    setIsWatching(true);

    try {
      const reward = await show();
      if (reward) {
        onReward(reward);
      }
    } catch (err) {
      onError?.(err as Error);
    } finally {
      setIsWatching(false);
    }
  }, [isLoaded, isWatching, show, onReward, onError]);

  // Don't show if ads are disabled (premium user)
  if (!shouldShowAds) {
    return null;
  }

  // Show loading state while ad loads
  if (!isLoaded && !error) {
    return (
      <View style={[styles.container, styles.loading, style]}>
        <ActivityIndicator size="small" color="#6b7280" />
        <Text style={styles.loadingText}>Loading reward...</Text>
      </View>
    );
  }

  // Show error state
  if (error && !isLoaded) {
    return (
      <View style={[styles.container, styles.error, style]}>
        <Ionicons name="alert-circle" size={20} color="#ef4444" />
        <Text style={styles.errorText}>Ad unavailable</Text>
      </View>
    );
  }

  const buttonTitle = title || rewardText || 'Watch Ad';

  return (
    <Button
      onPress={handlePress}
      disabled={disabled || !isLoaded || isWatching}
      loading={isWatching}
      leftIcon="play-circle"
      style={style}
    >
      {isWatching ? 'Watching...' : buttonTitle}
    </Button>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  loading: {
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
  },
  error: {
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
});

export default RewardedAdButton;
