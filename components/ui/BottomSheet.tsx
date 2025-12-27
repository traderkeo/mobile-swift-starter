/**
 * Bottom Sheet / Modal component with NativeWind styling
 *
 * Usage:
 * ```tsx
 * const [visible, setVisible] = useState(false);
 *
 * <BottomSheet visible={visible} onClose={() => setVisible(false)}>
 *   <View>
 *     <Text>Sheet content here</Text>
 *   </View>
 * </BottomSheet>
 * ```
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: ('auto' | number | `${number}%`)[];
  enableDragToClose?: boolean;
  showHandle?: boolean;
  title?: string;
  className?: string;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  enableDragToClose = true,
  showHandle = true,
  className = '',
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enableDragToClose,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return enableDragToClose && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const openSheet = useCallback(() => {
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
  }, [translateY, backdropOpacity]);

  const closeSheet = useCallback(() => {
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

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      openSheet();
    }
  }, [visible, translateY, openSheet]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
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
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={closeSheet} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          className={`rounded-t-2xl min-h-[100px] shadow-xl ${
            isDark ? 'bg-background-dark' : 'bg-background'
          } ${className}`}
          style={{
            maxHeight: SCREEN_HEIGHT * 0.9,
            paddingBottom: insets.bottom + 16,
            transform: [{ translateY }],
          }}
          {...panResponder.panHandlers}
        >
          {/* Handle */}
          {showHandle && (
            <View className="items-center py-3">
              <View className={`w-9 h-1 rounded-full ${isDark ? 'bg-white/30' : 'bg-black/20'}`} />
            </View>
          )}

          {/* Content */}
          <View className="px-5">{children}</View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
