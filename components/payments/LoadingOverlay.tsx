/**
 * LoadingOverlay component with NativeWind styling
 * Full-screen loading indicator for checkout process
 */

import React from 'react';
import { View, Modal, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Primary color for ActivityIndicator (matches tailwind.config.js)
const PRIMARY_COLOR = '#0a7ea4';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({
  visible,
  message = 'Processing payment...',
}: LoadingOverlayProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className={`p-8 rounded-xl items-center min-w-[200px] shadow-lg ${
            isDark ? 'bg-background-dark-secondary' : 'bg-background'
          }`}
        >
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <ThemedText className="mt-4 text-base text-center">{message}</ThemedText>
        </View>
      </View>
    </Modal>
  );
}
