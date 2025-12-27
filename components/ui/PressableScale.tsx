/**
 * PressableScale Component
 *
 * A pressable wrapper that adds scale animation on press.
 * Use this to add tactile feedback to any touchable element.
 *
 * @example
 * <PressableScale onPress={handlePress}>
 *   <View><Text>Press me</Text></View>
 * </PressableScale>
 *
 * @example
 * // With custom scale
 * <PressableScale onPress={handlePress} scale={0.9}>
 *   <Card>Content</Card>
 * </PressableScale>
 */

import React, { useRef, useCallback } from 'react';
import { Pressable, Animated, PressableProps, ViewStyle, StyleProp } from 'react-native';

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  /** Scale value when pressed (0-1). Default: 0.96 */
  scale?: number;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Whether the animation is disabled */
  animationDisabled?: boolean;
}

export function PressableScale({
  children,
  onPress,
  onPressIn,
  onPressOut,
  scale = 0.96,
  style,
  disabled,
  animationDisabled = false,
  ...props
}: PressableScaleProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(
    (event: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
      if (!animationDisabled) {
        Animated.spring(scaleAnim, {
          toValue: scale,
          useNativeDriver: true,
          speed: 50,
          bounciness: 4,
        }).start();
      }
      onPressIn?.(event);
    },
    [scaleAnim, scale, onPressIn, animationDisabled]
  );

  const handlePressOut = useCallback(
    (event: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
      if (!animationDisabled) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 8,
        }).start();
      }
      onPressOut?.(event);
    },
    [scaleAnim, onPressOut, animationDisabled]
  );

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default PressableScale;
