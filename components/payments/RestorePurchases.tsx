/**
 * RestorePurchases Component
 * Button to restore previous purchases (required for App Store compliance)
 *
 * Usage:
 * <RestorePurchases onRestored={() => console.log('Restored!')} />
 */

import React from 'react';
import { TouchableOpacity, ActivityIndicator, Alert, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRevenueCat } from '@/hooks/use-revenuecat';
import * as Haptics from 'expo-haptics';

interface RestorePurchasesProps {
  /** Called after successful restore */
  onRestored?: () => void;
  /** Button variant */
  variant?: 'text' | 'outlined' | 'filled';
  /** Custom label */
  label?: string;
  /** Show icon */
  showIcon?: boolean;
  /** Custom class name */
  className?: string;
}

export function RestorePurchases({
  onRestored,
  variant = 'text',
  label = 'Restore Purchases',
  showIcon = true,
  className = '',
}: RestorePurchasesProps) {
  const { restorePurchases, isLoading } = useRevenueCat();
  const [restoring, setRestoring] = React.useState(false);

  const tintColor = '#0a7ea4';

  const handleRestore = async () => {
    setRestoring(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const success = await restorePurchases();
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Your purchases have been restored!', [
          { text: 'OK', onPress: onRestored },
        ]);
      } else {
        Alert.alert(
          'No Purchases Found',
          "We couldn't find any previous purchases associated with your account."
        );
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Restore Failed', error.message || 'Please try again later.');
    } finally {
      setRestoring(false);
    }
  };

  const isDisabled = restoring || isLoading;

  if (variant === 'text') {
    return (
      <TouchableOpacity
        onPress={handleRestore}
        disabled={isDisabled}
        className={`py-3 items-center ${className}`}
      >
        {restoring ? (
          <ActivityIndicator size="small" color={tintColor} />
        ) : (
          <View className="flex-row items-center gap-2">
            {showIcon && <Ionicons name="refresh" size={18} color={tintColor} />}
            <Text style={{ color: tintColor }} className="font-medium">
              {label}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'outlined') {
    return (
      <TouchableOpacity
        onPress={handleRestore}
        disabled={isDisabled}
        className={`py-3 px-6 rounded-xl border border-primary flex-row items-center justify-center gap-2 ${
          isDisabled ? 'opacity-50' : ''
        } ${className}`}
      >
        {restoring ? (
          <ActivityIndicator size="small" color={tintColor} />
        ) : (
          <>
            {showIcon && <Ionicons name="refresh" size={18} color={tintColor} />}
            <Text style={{ color: tintColor }} className="font-semibold">
              {label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Filled variant
  return (
    <TouchableOpacity
      onPress={handleRestore}
      disabled={isDisabled}
      className={`py-3 px-6 rounded-xl bg-primary flex-row items-center justify-center gap-2 ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}
    >
      {restoring ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          {showIcon && <Ionicons name="refresh" size={18} color="white" />}
          <Text className="text-white font-semibold">{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
