/**
 * Toast notification system with NativeWind styling
 *
 * Usage:
 * ```tsx
 * // In your component:
 * const { showToast } = useToast();
 *
 * showToast({
 *   type: 'success',
 *   message: 'Changes saved successfully!',
 * });
 *
 * // In your app layout:
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Toast type configurations
 */
const toastConfig: Record<ToastType, { bgClass: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { bgClass: 'bg-success', icon: 'checkmark-circle' },
  error: { bgClass: 'bg-danger', icon: 'close-circle' },
  warning: { bgClass: 'bg-warning', icon: 'warning' },
  info: { bgClass: 'bg-info', icon: 'information-circle' },
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const insets = useSafeAreaInsets();

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setToast(null);
    });
  }, [translateY, opacity]);

  const showToast = useCallback(
    (config: ToastConfig) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If already showing, hide first
      if (visible) {
        hideToast();
        setTimeout(() => showToast(config), 350);
        return;
      }

      setToast(config);
      setVisible(true);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const duration = config.duration ?? 4000;
      timeoutRef.current = setTimeout(hideToast, duration);
    },
    [visible, hideToast, translateY, opacity]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {visible && toast && (
        <Animated.View
          className="absolute left-4 right-4 z-[9999]"
          style={{
            top: insets.top + 10,
            transform: [{ translateY }],
            opacity,
          }}
        >
          <TouchableOpacity
            className={`flex-row items-center py-3.5 px-4 rounded-lg shadow-lg ${toastConfig[toast.type].bgClass}`}
            onPress={hideToast}
            activeOpacity={0.9}
          >
            <Ionicons
              name={toastConfig[toast.type].icon}
              size={24}
              color="#ffffff"
              style={{ marginRight: 12 }}
            />
            <View className="flex-1">
              {toast.title && (
                <Text className="text-white text-[15px] font-bold mb-0.5">{toast.title}</Text>
              )}
              <Text className="text-white text-sm font-medium" numberOfLines={2}>
                {toast.message}
              </Text>
            </View>
            {toast.action && (
              <TouchableOpacity
                onPress={() => {
                  toast.action?.onPress();
                  hideToast();
                }}
                className="ml-3 py-1.5 px-3 bg-white/20 rounded-md"
              >
                <Text className="text-white text-[13px] font-semibold">{toast.action.label}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={hideToast} className="ml-2 p-1">
              <Ionicons name="close" size={18} color="#ffffff80" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}
