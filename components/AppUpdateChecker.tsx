/**
 * App Update Checker Component with NativeWind styling
 *
 * Displays a modal when an app update is available.
 * Place this in your root layout for automatic update checking.
 *
 * Usage:
 * ```tsx
 * // In your _layout.tsx
 * <AppUpdateChecker />
 * ```
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppUpdate } from '@/hooks/use-app-update';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AppUpdateCheckerProps {
  delay?: number;
  appIcon?: number;
}

export function AppUpdateChecker({ delay = 2000, appIcon }: AppUpdateCheckerProps) {
  const {
    isUpdateAvailable,
    isOtaUpdate,
    isStoreUpdate,
    isForceUpdate,
    newVersion,
    releaseNotes,
    applyOtaUpdate,
    openStore,
    dismissUpdate,
  } = useAppUpdate();

  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const tintColor = '#0a7ea4';

  // Show modal after delay
  useEffect(() => {
    if (isUpdateAvailable) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isUpdateAvailable, delay]);

  // Prevent back button on force update
  useEffect(() => {
    if (isForceUpdate && isVisible) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => backHandler.remove();
    }
  }, [isForceUpdate, isVisible]);

  const handleUpdate = async () => {
    setIsUpdating(true);

    if (isOtaUpdate) {
      await applyOtaUpdate();
    } else if (isStoreUpdate) {
      openStore();
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    if (!isForceUpdate) {
      dismissUpdate();
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={isForceUpdate ? undefined : handleDismiss}
    >
      <View className="flex-1 bg-black/60 justify-center items-center p-6">
        <View
          className={`w-full max-w-[340px] rounded-2xl p-6 items-center shadow-xl ${
            isDark ? 'bg-background-dark' : 'bg-background'
          }`}
        >
          {/* App Icon */}
          {appIcon ? (
            <Image source={appIcon} className="w-20 h-20 rounded-xl mb-4" />
          ) : (
            <View
              className="w-20 h-20 rounded-xl justify-center items-center mb-4"
              style={{ backgroundColor: tintColor + '15' }}
            >
              <Ionicons name="cloud-download-outline" size={48} color={tintColor} />
            </View>
          )}

          {/* Title */}
          <Text className="text-[22px] font-bold mb-2 text-center" style={{ color: textColor }}>
            {isForceUpdate ? 'Update Required' : 'Update Available'}
          </Text>

          {/* Version info */}
          {newVersion && (
            <Text className="text-sm mb-3" style={{ color: textColor + '80' }}>
              Version {newVersion} is now available
            </Text>
          )}

          {/* Description */}
          <Text
            className="text-[15px] text-center leading-[22px] mb-5"
            style={{ color: textColor + '80' }}
          >
            {isForceUpdate
              ? 'This update is required to continue using the app. Please update now.'
              : isOtaUpdate
                ? 'A new update is available. Update now to get the latest features and improvements.'
                : 'A new version is available in the app store with bug fixes and new features.'}
          </Text>

          {/* Release notes */}
          {releaseNotes && (
            <View
              className="w-full p-3 rounded-[10px] mb-5"
              style={{ backgroundColor: textColor + '10' }}
            >
              <Text className="text-[13px] font-semibold mb-1.5" style={{ color: textColor }}>
                {"What's New:"}
              </Text>
              <Text className="text-[13px] leading-[18px]" style={{ color: textColor + '80' }}>
                {releaseNotes}
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View className="flex-row gap-3 w-full">
            {!isForceUpdate && (
              <TouchableOpacity
                className="flex-1 h-12 rounded-lg justify-center items-center border"
                style={{ borderColor: textColor + '30' }}
                onPress={handleDismiss}
                disabled={isUpdating}
              >
                <Text className="text-base font-semibold" style={{ color: textColor }}>
                  Later
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className={`h-12 rounded-lg justify-center items-center ${
                isForceUpdate ? 'flex-1' : 'flex-1'
              }`}
              style={{ backgroundColor: tintColor }}
              onPress={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  {isOtaUpdate ? 'Update Now' : 'Go to Store'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* OTA indicator */}
          {isOtaUpdate && (
            <Text className="text-xs mt-3" style={{ color: textColor + '60' }}>
              This update will be applied instantly
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}
