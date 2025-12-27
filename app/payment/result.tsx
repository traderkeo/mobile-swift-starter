/**
 * Payment Result screen
 */

import { StatusIcon } from '@/components/payments/StatusIcon';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PaymentStatus } from '@/types/payments';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const status = (params.status as PaymentStatus) || 'failed';

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    // Haptic feedback based on result
    if (status === 'active' || status === 'succeeded') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [status]);

  const getConfig = () => {
    switch (status) {
      case 'active':
      case 'succeeded':
        return {
          title: 'Payment Successful!',
          message: 'Thank you for subscribing to Premium. Your account has been upgraded.',
          primaryButton: 'Continue',
          primaryAction: () => router.replace('/'),
        };
      default:
        return {
          title: 'Payment Failed',
          message: (params.message as string) || 'Something went wrong. Please try again.',
          primaryButton: 'Try Again',
          primaryAction: () => router.replace('/'),
          secondaryButton: 'Go Back',
          secondaryAction: () => router.back(),
        };
    }
  };

  const config = getConfig();

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
      <View className="flex-1 justify-center items-center p-8">
        {/* Status Icon */}
        <View className="mb-8">
          <StatusIcon status={status} />
        </View>

        {/* Title */}
        <ThemedText className="text-[28px] font-bold text-center mb-4">{config.title}</ThemedText>

        {/* Message */}
        <ThemedText className="text-base text-center opacity-80 leading-6 mb-6 px-4">
          {config.message}
        </ThemedText>

        {/* Action Buttons */}
        <View className="w-full gap-3">
          <Pressable
            onPress={config.primaryAction}
            className="py-4 px-8 rounded-xl items-center bg-primary active:opacity-80"
          >
            <Text className="text-white text-base font-semibold">{config.primaryButton}</Text>
          </Pressable>

          {config.secondaryButton && (
            <Pressable
              onPress={config.secondaryAction}
              className={`py-4 px-8 rounded-xl items-center active:opacity-80 ${isDark ? 'bg-white/20' : 'bg-black/10'}`}
            >
              <ThemedText className="text-base font-semibold">{config.secondaryButton}</ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
