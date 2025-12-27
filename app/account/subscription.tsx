/**
 * Subscription Details screen
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRevenueCat } from '@/hooks/use-revenuecat';
import { LEGAL_URLS } from '@/config/legal-content';

export default function SubscriptionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isPremium, customerInfo, isLoading, restorePurchases } = useRevenueCat();

  const activeSubscription = customerInfo?.activeSubscriptions?.[0];
  const expirationDate = customerInfo?.latestExpirationDate
    ? new Date(customerInfo.latestExpirationDate)
    : null;

  const handleManageSubscription = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  const handleRestorePurchases = async () => {
    try {
      await restorePurchases();
    } catch {
      // Error handled in hook
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-secondary-200 dark:border-secondary-700">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Subscription
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Status Card */}
        <View
          className={`rounded-2xl p-6 mb-6 ${isPremium ? 'bg-primary' : isDark ? 'bg-secondary-800' : 'bg-secondary-100'}`}
        >
          <View className="flex-row items-center mb-4">
            <View
              className={`w-12 h-12 rounded-full items-center justify-center ${isPremium ? 'bg-white/20' : isDark ? 'bg-secondary-700' : 'bg-secondary-200'}`}
            >
              <Ionicons
                name={isPremium ? 'star' : 'star-outline'}
                size={24}
                color={isPremium ? '#fff' : isDark ? '#9ca3af' : '#6b7280'}
              />
            </View>
            <View className="ml-4 flex-1">
              <Text
                className={`text-xl font-bold ${isPremium ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {isPremium ? 'Premium' : 'Free Plan'}
              </Text>
              <Text
                className={`text-sm ${isPremium ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {isPremium ? 'Full access to all features' : 'Limited features'}
              </Text>
            </View>
          </View>

          {isPremium && expirationDate && (
            <View
              className={`pt-4 border-t ${isPremium ? 'border-white/20' : 'border-secondary-200'}`}
            >
              <Text className={isPremium ? 'text-white/80 text-sm' : 'text-gray-500 text-sm'}>
                {expirationDate > new Date() ? 'Renews on' : 'Expired on'}:{' '}
                {expirationDate.toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Features List */}
        <View className="mb-6">
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isPremium ? 'Your Benefits' : 'Upgrade to Premium'}
          </Text>

          {[
            { icon: 'checkmark-circle', text: 'Unlimited access', included: isPremium },
            { icon: 'checkmark-circle', text: 'No advertisements', included: isPremium },
            { icon: 'checkmark-circle', text: 'Priority support', included: isPremium },
            { icon: 'checkmark-circle', text: 'Early access to features', included: isPremium },
          ].map((feature, index) => (
            <View key={index} className="flex-row items-center py-3">
              <Ionicons
                name={feature.included ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={24}
                color={feature.included ? '#22c55e' : isDark ? '#6b7280' : '#9ca3af'}
              />
              <Text
                className={`ml-3 text-base ${feature.included ? (isDark ? 'text-white' : 'text-gray-900') : isDark ? 'text-gray-500' : 'text-gray-400'}`}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View className="gap-3">
          {isPremium ? (
            <TouchableOpacity
              className={`h-14 rounded-lg justify-center items-center border ${isDark ? 'border-secondary-600' : 'border-secondary-300'}`}
              onPress={handleManageSubscription}
            >
              <Text
                className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Manage Subscription
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="h-14 rounded-lg justify-center items-center bg-primary"
              onPress={() => router.push('/(tabs)')}
            >
              <Text className="text-white text-base font-semibold">Upgrade to Premium</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className={`h-14 rounded-lg justify-center items-center ${isDark ? 'bg-secondary-800' : 'bg-secondary-100'}`}
            onPress={handleRestorePurchases}
            disabled={isLoading}
          >
            <Text className={`text-base font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Restore Purchases
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms Link */}
        <TouchableOpacity className="mt-6 mb-8" onPress={() => Linking.openURL(LEGAL_URLS.terms)}>
          <Text className="text-center text-sm text-primary">
            Terms of Service & Subscription Policy
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
