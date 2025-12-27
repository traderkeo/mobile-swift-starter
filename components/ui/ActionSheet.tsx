/**
 * ActionSheet component for iOS-style bottom action menus
 *
 * Usage:
 * ```tsx
 * <ActionSheet
 *   visible={showActions}
 *   title="Choose an action"
 *   onClose={() => setShowActions(false)}
 *   actions={[
 *     { label: 'Edit', icon: 'pencil', onPress: handleEdit },
 *     { label: 'Share', icon: 'share', onPress: handleShare },
 *     { label: 'Delete', icon: 'trash', color: 'danger', onPress: handleDelete },
 *   ]}
 * />
 *
 * // Using context
 * const { showActionSheet } = useActionSheet();
 * await showActionSheet({
 *   title: 'Options',
 *   actions: [...],
 * });
 * ```
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Local color constants for icons and buttons (match tailwind.config.js)
const ACTION_COLORS = {
  primary: '#0a7ea4',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
};

// Types
export type ActionColor = 'default' | 'primary' | 'danger' | 'success' | 'warning';

export interface ActionSheetAction {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: ActionColor;
  disabled?: boolean;
  onPress?: () => void;
}

export interface ActionSheetProps {
  visible: boolean;
  title?: string;
  message?: string;
  actions: ActionSheetAction[];
  cancelLabel?: string;
  showCancel?: boolean;
  onClose: () => void;
  destructiveIndex?: number;
  className?: string;
}

// Color configurations
const getActionColor = (color: ActionColor, isDark: boolean) => {
  switch (color) {
    case 'primary':
      return ACTION_COLORS.primary;
    case 'danger':
      return ACTION_COLORS.danger;
    case 'success':
      return ACTION_COLORS.success;
    case 'warning':
      return ACTION_COLORS.warning;
    default:
      return isDark ? '#FFFFFF' : '#000000';
  }
};

// Main ActionSheet Component
export function ActionSheet({
  visible,
  title,
  message,
  actions,
  cancelLabel = 'Cancel',
  showCancel = true,
  onClose,
  destructiveIndex,
  className = '',
}: ActionSheetProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 65,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  const handleActionPress = (action: ActionSheetAction) => {
    close();
    setTimeout(() => {
      action.onPress?.();
    }, 250);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View
        className="absolute inset-0 bg-black"
        style={{
          opacity: backdropOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
          }),
        }}
      >
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={close} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        className={`absolute bottom-0 left-0 right-0 ${className}`}
        style={{
          transform: [{ translateY }],
          paddingBottom: insets.bottom,
        }}
      >
        <View className="mx-3">
          {/* Actions group */}
          <View className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header */}
            {(title || message) && (
              <View
                className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                {title && (
                  <Text
                    className={`text-center text-sm font-semibold ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {title}
                  </Text>
                )}
                {message && (
                  <Text
                    className={`text-center text-xs mt-1 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    {message}
                  </Text>
                )}
              </View>
            )}

            {/* Actions */}
            <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.5 }} bounces={false}>
              {actions.map((action, index) => {
                const isDestructive = index === destructiveIndex || action.color === 'danger';
                const color = action.color || (isDestructive ? 'danger' : 'default');
                const textColor = getActionColor(color, isDark);

                return (
                  <TouchableOpacity
                    key={index}
                    className={`flex-row items-center justify-center py-4 px-4 ${
                      index > 0
                        ? isDark
                          ? 'border-t border-gray-700'
                          : 'border-t border-gray-200'
                        : ''
                    } ${action.disabled ? 'opacity-40' : ''}`}
                    onPress={() => !action.disabled && handleActionPress(action)}
                    disabled={action.disabled}
                  >
                    {action.icon && (
                      <Ionicons
                        name={action.icon}
                        size={22}
                        color={textColor}
                        style={{ marginRight: 10 }}
                      />
                    )}
                    <Text
                      className="text-lg"
                      style={{
                        color: textColor,
                        fontWeight: isDestructive ? '600' : '400',
                      }}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Cancel button */}
          {showCancel && (
            <TouchableOpacity
              className={`mt-2 py-4 rounded-xl items-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
              onPress={close}
            >
              <Text className="text-lg font-semibold" style={{ color: ACTION_COLORS.primary }}>
                {cancelLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Safe area padding */}
        <View style={{ height: 8 }} />
      </Animated.View>
    </Modal>
  );
}

// Menu-style ActionSheet - more compact with left-aligned items
export interface MenuSheetProps {
  visible: boolean;
  title?: string;
  items: ActionSheetAction[];
  onClose: () => void;
  className?: string;
}

export function MenuSheet({ visible, title, items, onClose, className = '' }: MenuSheetProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  const handleItemPress = (item: ActionSheetAction) => {
    close();
    setTimeout(() => {
      item.onPress?.();
    }, 250);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View
        className="absolute inset-0 bg-black"
        style={{
          opacity: backdropOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
          }),
        }}
      >
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={close} />
      </Animated.View>

      <Animated.View
        className={`absolute bottom-0 left-0 right-0 rounded-t-2xl ${
          isDark ? 'bg-gray-900' : 'bg-white'
        } ${className}`}
        style={{
          transform: [{ translateY }],
          paddingBottom: insets.bottom + 8,
        }}
      >
        {/* Handle */}
        <View className="items-center py-3">
          <View className={`w-9 h-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
        </View>

        {/* Title */}
        {title && (
          <Text
            className={`px-5 pb-3 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {title}
          </Text>
        )}

        {/* Items */}
        <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.6 }} bounces={false}>
          {items.map((item, index) => {
            const color = item.color || 'default';
            const textColor = getActionColor(color, isDark);

            return (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center px-5 py-4 ${item.disabled ? 'opacity-40' : ''}`}
                onPress={() => !item.disabled && handleItemPress(item)}
                disabled={item.disabled}
              >
                {item.icon && (
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                      isDark ? 'bg-gray-800' : 'bg-gray-100'
                    }`}
                  >
                    <Ionicons name={item.icon} size={20} color={textColor} />
                  </View>
                )}
                <Text className="text-base flex-1" style={{ color: textColor }}>
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// Share Sheet - specialized for sharing actions
export interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  onShare: (platform: string) => void;
  platforms?: {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color?: string;
  }[];
  title?: string;
  message?: string;
}

const defaultPlatforms = [
  { id: 'copy', label: 'Copy Link', icon: 'copy-outline' as const, color: '#6B7280' },
  { id: 'message', label: 'Message', icon: 'chatbubble-outline' as const, color: '#34D399' },
  { id: 'mail', label: 'Email', icon: 'mail-outline' as const, color: '#3B82F6' },
  { id: 'twitter', label: 'Twitter', icon: 'logo-twitter' as const, color: '#1DA1F2' },
  { id: 'facebook', label: 'Facebook', icon: 'logo-facebook' as const, color: '#4267B2' },
  { id: 'more', label: 'More', icon: 'ellipsis-horizontal' as const, color: '#6B7280' },
];

export function ShareSheet({
  visible,
  onClose,
  onShare,
  platforms = defaultPlatforms,
  title = 'Share',
  message,
}: ShareSheetProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  const handleShare = (platformId: string) => {
    close();
    setTimeout(() => {
      onShare(platformId);
    }, 250);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View
        className="absolute inset-0 bg-black"
        style={{
          opacity: backdropOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
          }),
        }}
      >
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={close} />
      </Animated.View>

      <Animated.View
        className={`absolute bottom-0 left-0 right-0 rounded-t-2xl ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
        style={{
          transform: [{ translateY }],
          paddingBottom: insets.bottom + 8,
        }}
      >
        {/* Handle */}
        <View className="items-center py-3">
          <View className={`w-9 h-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
        </View>

        {/* Header */}
        <View className="px-5 pb-4">
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </Text>
          {message && (
            <Text className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {message}
            </Text>
          )}
        </View>

        {/* Platforms grid */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
        >
          {platforms.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              className="items-center"
              onPress={() => handleShare(platform.id)}
              style={{ width: 72 }}
            >
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: platform.color || ACTION_COLORS.primary }}
              >
                <Ionicons name={platform.icon} size={24} color="#FFFFFF" />
              </View>
              <Text
                className={`text-xs text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                numberOfLines={1}
              >
                {platform.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cancel */}
        <TouchableOpacity
          className={`mx-5 mt-6 py-4 rounded-xl items-center ${
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          }`}
          onPress={close}
        >
          <Text className={isDark ? 'text-white font-medium' : 'text-gray-900 font-medium'}>
            Cancel
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

// Context-based ActionSheet
interface ActionSheetContextConfig {
  title?: string;
  message?: string;
  actions: ActionSheetAction[];
  cancelLabel?: string;
  destructiveIndex?: number;
}

interface ActionSheetContextType {
  showActionSheet: (config: ActionSheetContextConfig) => Promise<number | null>;
}

const ActionSheetContext = createContext<ActionSheetContextType | undefined>(undefined);

export function useActionSheet() {
  const context = useContext(ActionSheetContext);
  if (!context) {
    throw new Error('useActionSheet must be used within an ActionSheetProvider');
  }
  return context;
}

interface ActionSheetProviderProps {
  children: React.ReactNode;
}

export function ActionSheetProvider({ children }: ActionSheetProviderProps) {
  const [config, setConfig] = useState<ActionSheetContextConfig | null>(null);
  const resolveRef = useRef<((index: number | null) => void) | null>(null);

  const showActionSheet = useCallback(
    (newConfig: ActionSheetContextConfig): Promise<number | null> => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setConfig(newConfig);
      });
    },
    []
  );

  const handleClose = () => {
    setConfig(null);
    resolveRef.current?.(null);
    resolveRef.current = null;
  };

  const handleActionPress = (index: number) => {
    setConfig(null);
    resolveRef.current?.(index);
    resolveRef.current = null;
  };

  const wrappedActions =
    config?.actions.map((action, index) => ({
      ...action,
      onPress: () => handleActionPress(index),
    })) || [];

  return (
    <ActionSheetContext.Provider value={{ showActionSheet }}>
      {children}
      <ActionSheet
        visible={!!config}
        title={config?.title}
        message={config?.message}
        actions={wrappedActions}
        cancelLabel={config?.cancelLabel}
        destructiveIndex={config?.destructiveIndex}
        onClose={handleClose}
      />
    </ActionSheetContext.Provider>
  );
}
