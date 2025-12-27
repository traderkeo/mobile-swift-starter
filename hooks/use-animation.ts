/**
 * Animation Hooks
 *
 * Reusable hooks for common animation patterns.
 * Built on React Native Animated API with native driver support.
 *
 * @example
 * import {
 *   useFadeIn,
 *   useSlideIn,
 *   useScale,
 *   useSpring,
 *   useShake,
 * } from '@/hooks/use-animation';
 *
 * function MyComponent() {
 *   const { animatedStyle, animate } = useFadeIn();
 *
 *   useEffect(() => {
 *     animate();
 *   }, []);
 *
 *   return <Animated.View style={animatedStyle}>...</Animated.View>;
 * }
 */

import { useRef, useCallback, useEffect, useMemo } from 'react';
import { Animated, ViewStyle } from 'react-native';
import {
  SpringPresets,
  TimingPresets,
  Easings,
  withSpring,
  withTiming,
  sequence,
  loop,
  createShakeAnimation,
  createPulseAnimation,
  createBreathingAnimation,
  createBounceAnimation,
  createShimmerAnimation,
  interpolateOpacity,
  interpolateScale,
  interpolateTranslateX,
  interpolateTranslateY,
  interpolateRotation,
  animateLayout,
  type SpringPreset,
  type TimingPreset,
  type EntranceDirection,
  type LayoutAnimationPreset,
} from '@/lib/animations';

// ===========================================
// BASE HOOKS
// ===========================================

/**
 * Create and manage an Animated.Value with utilities
 */
export function useAnimatedValue(initialValue: number = 0) {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const setValue = useCallback(
    (value: number) => {
      animatedValue.setValue(value);
    },
    [animatedValue]
  );

  const spring = useCallback(
    (toValue: number, preset: SpringPreset = 'default') => {
      return withSpring(animatedValue, toValue, preset);
    },
    [animatedValue]
  );

  const timing = useCallback(
    (toValue: number, preset: TimingPreset = 'default') => {
      return withTiming(animatedValue, toValue, preset);
    },
    [animatedValue]
  );

  const stop = useCallback(() => {
    animatedValue.stopAnimation();
  }, [animatedValue]);

  const reset = useCallback(() => {
    animatedValue.setValue(initialValue);
  }, [animatedValue, initialValue]);

  return {
    value: animatedValue,
    setValue,
    spring,
    timing,
    stop,
    reset,
  };
}

/**
 * Create and manage an Animated.ValueXY for 2D animations
 */
export function useAnimatedValueXY(initialValue: { x: number; y: number } = { x: 0, y: 0 }) {
  const animatedValue = useRef(new Animated.ValueXY(initialValue)).current;

  const setValue = useCallback(
    (value: { x: number; y: number }) => {
      animatedValue.setValue(value);
    },
    [animatedValue]
  );

  const spring = useCallback(
    (toValue: { x: number; y: number }, preset: SpringPreset = 'default') => {
      return withSpring(animatedValue, toValue, preset);
    },
    [animatedValue]
  );

  const reset = useCallback(() => {
    animatedValue.setValue(initialValue);
  }, [animatedValue, initialValue]);

  return {
    value: animatedValue,
    x: animatedValue.x,
    y: animatedValue.y,
    setValue,
    spring,
    reset,
    getLayout: () => animatedValue.getLayout(),
    getTranslateTransform: () => animatedValue.getTranslateTransform(),
  };
}

// ===========================================
// ENTRANCE ANIMATION HOOKS
// ===========================================

export interface EntranceAnimationOptions {
  /** Initial value (0 = hidden, 1 = visible) */
  initialValue?: number;
  /** Animation preset */
  preset?: SpringPreset | TimingPreset;
  /** Use spring or timing animation */
  type?: 'spring' | 'timing';
  /** Auto-play on mount */
  autoPlay?: boolean;
  /** Delay before animation starts */
  delay?: number;
}

/**
 * Fade in animation hook
 */
export function useFadeIn(options: EntranceAnimationOptions = {}) {
  const {
    initialValue = 0,
    preset = 'default',
    type = 'timing',
    autoPlay = false,
    delay: delayMs = 0,
  } = options;

  const progress = useRef(new Animated.Value(initialValue)).current;

  const animate = useCallback(
    (callback?: () => void) => {
      const animation =
        type === 'spring'
          ? withSpring(progress, 1, preset as SpringPreset)
          : withTiming(progress, 1, preset as TimingPreset);

      if (delayMs > 0) {
        sequence([Animated.delay(delayMs), animation]).start(callback);
      } else {
        animation.start(callback);
      }
    },
    [progress, type, preset, delayMs]
  );

  const animateOut = useCallback(
    (callback?: () => void) => {
      const animation =
        type === 'spring'
          ? withSpring(progress, 0, preset as SpringPreset)
          : withTiming(progress, 0, preset as TimingPreset);
      animation.start(callback);
    },
    [progress, type, preset]
  );

  const reset = useCallback(() => {
    progress.setValue(initialValue);
  }, [progress, initialValue]);

  useEffect(() => {
    if (autoPlay) {
      animate();
    }
  }, [autoPlay, animate]);

  const animatedStyle = useMemo(
    () => ({
      opacity: progress,
    }),
    [progress]
  );

  return {
    progress,
    animatedStyle,
    animate,
    animateOut,
    reset,
  };
}

/**
 * Slide in animation hook
 */
export function useSlideIn(
  direction: EntranceDirection = 'up',
  options: EntranceAnimationOptions & { distance?: number } = {}
) {
  const {
    initialValue = 0,
    preset = 'default',
    type = 'spring',
    autoPlay = false,
    delay: delayMs = 0,
    distance = 50,
  } = options;

  const progress = useRef(new Animated.Value(initialValue)).current;

  const animate = useCallback(
    (callback?: () => void) => {
      const animation =
        type === 'spring'
          ? withSpring(progress, 1, preset as SpringPreset)
          : withTiming(progress, 1, preset as TimingPreset);

      if (delayMs > 0) {
        sequence([Animated.delay(delayMs), animation]).start(callback);
      } else {
        animation.start(callback);
      }
    },
    [progress, type, preset, delayMs]
  );

  const animateOut = useCallback(
    (callback?: () => void) => {
      const animation =
        type === 'spring'
          ? withSpring(progress, 0, preset as SpringPreset)
          : withTiming(progress, 0, preset as TimingPreset);
      animation.start(callback);
    },
    [progress, type, preset]
  );

  const reset = useCallback(() => {
    progress.setValue(initialValue);
  }, [progress, initialValue]);

  useEffect(() => {
    if (autoPlay) {
      animate();
    }
  }, [autoPlay, animate]);

  const animatedStyle = useMemo(() => {
    const opacity = interpolateOpacity(progress);

    const getTransform = () => {
      switch (direction) {
        case 'up':
          return [{ translateY: interpolateTranslateY(progress, [0, 1], [distance, 0]) }];
        case 'down':
          return [{ translateY: interpolateTranslateY(progress, [0, 1], [-distance, 0]) }];
        case 'left':
          return [{ translateX: interpolateTranslateX(progress, [0, 1], [distance, 0]) }];
        case 'right':
          return [{ translateX: interpolateTranslateX(progress, [0, 1], [-distance, 0]) }];
      }
    };

    return {
      opacity,
      transform: getTransform(),
    };
  }, [progress, direction, distance]);

  return {
    progress,
    animatedStyle,
    animate,
    animateOut,
    reset,
  };
}

/**
 * Scale in animation hook
 */
export function useScaleIn(options: EntranceAnimationOptions & { startScale?: number } = {}) {
  const {
    initialValue = 0,
    preset = 'bouncy',
    type = 'spring',
    autoPlay = false,
    delay: delayMs = 0,
    startScale = 0.8,
  } = options;

  const progress = useRef(new Animated.Value(initialValue)).current;

  const animate = useCallback(
    (callback?: () => void) => {
      const animation =
        type === 'spring'
          ? withSpring(progress, 1, preset as SpringPreset)
          : withTiming(progress, 1, preset as TimingPreset);

      if (delayMs > 0) {
        sequence([Animated.delay(delayMs), animation]).start(callback);
      } else {
        animation.start(callback);
      }
    },
    [progress, type, preset, delayMs]
  );

  const animateOut = useCallback(
    (callback?: () => void) => {
      const animation =
        type === 'spring'
          ? withSpring(progress, 0, preset as SpringPreset)
          : withTiming(progress, 0, preset as TimingPreset);
      animation.start(callback);
    },
    [progress, type, preset]
  );

  const reset = useCallback(() => {
    progress.setValue(initialValue);
  }, [progress, initialValue]);

  useEffect(() => {
    if (autoPlay) {
      animate();
    }
  }, [autoPlay, animate]);

  const animatedStyle = useMemo(
    () => ({
      opacity: interpolateOpacity(progress),
      transform: [
        {
          scale: interpolateScale(progress, [0, 1], [startScale, 1]),
        },
      ],
    }),
    [progress, startScale]
  );

  return {
    progress,
    animatedStyle,
    animate,
    animateOut,
    reset,
  };
}

/**
 * Zoom in animation (scale from 0)
 */
export function useZoomIn(options: EntranceAnimationOptions = {}) {
  return useScaleIn({ ...options, startScale: 0 });
}

// ===========================================
// INTERACTIVE ANIMATION HOOKS
// ===========================================

/**
 * Press scale animation (for touchable elements)
 */
export function usePressAnimation(pressScale: number = 0.96, options: { disabled?: boolean } = {}) {
  const { disabled = false } = options;
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    if (disabled) return;
    withSpring(scale, pressScale, 'press').start();
  }, [scale, pressScale, disabled]);

  const onPressOut = useCallback(() => {
    if (disabled) return;
    withSpring(scale, 1, 'release').start();
  }, [scale, disabled]);

  const animatedStyle = useMemo(
    () => ({
      transform: [{ scale }],
    }),
    [scale]
  );

  return {
    scale,
    animatedStyle,
    onPressIn,
    onPressOut,
    handlers: { onPressIn, onPressOut },
  };
}

/**
 * Spring animation with custom control
 */
export function useSpring(initialValue: number = 0) {
  const value = useRef(new Animated.Value(initialValue)).current;

  const animate = useCallback(
    (toValue: number, preset: SpringPreset = 'default', callback?: () => void) => {
      withSpring(value, toValue, preset).start(callback);
    },
    [value]
  );

  const setValue = useCallback(
    (newValue: number) => {
      value.setValue(newValue);
    },
    [value]
  );

  return {
    value,
    animate,
    setValue,
  };
}

// ===========================================
// EFFECT ANIMATION HOOKS
// ===========================================

/**
 * Shake animation (for error feedback)
 */
export function useShake(intensity: number = 10) {
  const translateX = useRef(new Animated.Value(0)).current;

  const shake = useCallback(
    (callback?: () => void) => {
      createShakeAnimation(translateX, intensity).start(callback);
    },
    [translateX, intensity]
  );

  const animatedStyle = useMemo(
    () => ({
      transform: [{ translateX }],
    }),
    [translateX]
  );

  return {
    translateX,
    animatedStyle,
    shake,
  };
}

/**
 * Pulse animation (attention-grabbing)
 */
export function usePulse(
  options: { minScale?: number; maxScale?: number; autoPlay?: boolean } = {}
) {
  const { minScale = 0.95, maxScale = 1.05, autoPlay = false } = options;
  const scale = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const start = useCallback(() => {
    animationRef.current = createPulseAnimation(scale, minScale, maxScale);
    animationRef.current.start();
  }, [scale, minScale, maxScale]);

  const stop = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      scale.setValue(1);
    }
  }, [scale]);

  useEffect(() => {
    if (autoPlay) {
      start();
    }
    return () => stop();
  }, [autoPlay, start, stop]);

  const animatedStyle = useMemo(
    () => ({
      transform: [{ scale }],
    }),
    [scale]
  );

  return {
    scale,
    animatedStyle,
    start,
    stop,
  };
}

/**
 * Breathing animation (subtle, calming pulse)
 */
export function useBreathing(options: { duration?: number; autoPlay?: boolean } = {}) {
  const { duration = 2000, autoPlay = false } = options;
  const scale = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const start = useCallback(() => {
    animationRef.current = createBreathingAnimation(scale, duration);
    animationRef.current.start();
  }, [scale, duration]);

  const stop = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      scale.setValue(1);
    }
  }, [scale]);

  useEffect(() => {
    if (autoPlay) {
      start();
    }
    return () => stop();
  }, [autoPlay, start, stop]);

  const animatedStyle = useMemo(
    () => ({
      transform: [{ scale }],
    }),
    [scale]
  );

  return {
    scale,
    animatedStyle,
    start,
    stop,
  };
}

/**
 * Bounce animation
 */
export function useBounce(height: number = -20) {
  const translateY = useRef(new Animated.Value(0)).current;

  const bounce = useCallback(
    (callback?: () => void) => {
      createBounceAnimation(translateY, height).start(callback);
    },
    [translateY, height]
  );

  const animatedStyle = useMemo(
    () => ({
      transform: [{ translateY }],
    }),
    [translateY]
  );

  return {
    translateY,
    animatedStyle,
    bounce,
  };
}

/**
 * Shimmer animation (for loading states)
 */
export function useShimmer(options: { duration?: number; autoPlay?: boolean } = {}) {
  const { duration = 1200, autoPlay = true } = options;
  const opacity = useRef(new Animated.Value(0.3)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const start = useCallback(() => {
    animationRef.current = loop(
      sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration / 2,
          easing: Easings.easeInOut,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: duration / 2,
          easing: Easings.easeInOut,
          useNativeDriver: true,
        }),
      ])
    );
    animationRef.current.start();
  }, [opacity, duration]);

  const stop = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
  }, []);

  useEffect(() => {
    if (autoPlay) {
      start();
    }
    return () => stop();
  }, [autoPlay, start, stop]);

  const animatedStyle = useMemo(
    () => ({
      opacity,
    }),
    [opacity]
  );

  return {
    opacity,
    animatedStyle,
    start,
    stop,
  };
}

/**
 * Rotation animation
 */
export function useRotation(
  options: {
    duration?: number;
    loop?: boolean;
    autoPlay?: boolean;
  } = {}
) {
  const { duration = 1000, loop: shouldLoop = false, autoPlay = false } = options;
  const rotation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const rotate = useCallback(
    (toValue: number = 1, callback?: () => void) => {
      const animation = Animated.timing(rotation, {
        toValue,
        duration,
        easing: Easings.linear,
        useNativeDriver: true,
      });

      if (shouldLoop) {
        animationRef.current = loop(animation);
        animationRef.current.start();
      } else {
        animation.start(callback);
      }
    },
    [rotation, duration, shouldLoop]
  );

  const stop = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
    rotation.stopAnimation();
  }, [rotation]);

  const reset = useCallback(() => {
    rotation.setValue(0);
  }, [rotation]);

  useEffect(() => {
    if (autoPlay) {
      rotate();
    }
    return () => stop();
  }, [autoPlay, rotate, stop]);

  const animatedStyle = useMemo(
    () => ({
      transform: [
        {
          rotate: rotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
    }),
    [rotation]
  );

  return {
    rotation,
    animatedStyle,
    rotate,
    stop,
    reset,
  };
}

// ===========================================
// STAGGER ANIMATION HOOKS
// ===========================================

/**
 * Staggered animation for list items
 */
export function useStaggeredAnimation(
  itemCount: number,
  options: {
    staggerDelay?: number;
    preset?: SpringPreset | TimingPreset;
    type?: 'spring' | 'timing';
  } = {}
) {
  const { staggerDelay = 50, preset = 'default', type = 'spring' } = options;

  const values = useRef<Animated.Value[]>(
    Array.from({ length: itemCount }, () => new Animated.Value(0))
  ).current;

  const animate = useCallback(
    (callback?: () => void) => {
      const animations = values.map((value) =>
        type === 'spring'
          ? withSpring(value, 1, preset as SpringPreset)
          : withTiming(value, 1, preset as TimingPreset)
      );

      Animated.stagger(staggerDelay, animations).start(callback);
    },
    [values, type, preset, staggerDelay]
  );

  const reset = useCallback(() => {
    values.forEach((value) => value.setValue(0));
  }, [values]);

  const getItemStyle = useCallback(
    (index: number): ViewStyle => {
      if (index >= values.length) return {};

      return {
        opacity: values[index],
        transform: [
          {
            translateY: values[index].interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      } as ViewStyle;
    },
    [values]
  );

  return {
    values,
    animate,
    reset,
    getItemStyle,
  };
}

// ===========================================
// LAYOUT ANIMATION HOOK
// ===========================================

/**
 * Hook for layout animations
 */
export function useLayoutAnimation() {
  const animate = useCallback((preset: LayoutAnimationPreset = 'spring') => {
    animateLayout(preset);
  }, []);

  return {
    animate,
    spring: () => animateLayout('spring'),
    fade: () => animateLayout('fade'),
    scale: () => animateLayout('scale'),
    quick: () => animateLayout('quick'),
    height: () => animateLayout('height'),
  };
}

// ===========================================
// COMBINED ANIMATION HOOK
// ===========================================

/**
 * Combined animation for complex entrance effects
 */
export function useCombinedEntrance(
  options: {
    fade?: boolean;
    slide?: EntranceDirection;
    scale?: boolean;
    delay?: number;
    preset?: SpringPreset;
  } = {}
) {
  const { fade = true, slide, scale = false, delay: delayMs = 0, preset = 'default' } = options;

  const progress = useRef(new Animated.Value(0)).current;

  const animate = useCallback(
    (callback?: () => void) => {
      const animation = withSpring(progress, 1, preset);

      if (delayMs > 0) {
        sequence([Animated.delay(delayMs), animation]).start(callback);
      } else {
        animation.start(callback);
      }
    },
    [progress, preset, delayMs]
  );

  const animateOut = useCallback(
    (callback?: () => void) => {
      withSpring(progress, 0, preset).start(callback);
    },
    [progress, preset]
  );

  const reset = useCallback(() => {
    progress.setValue(0);
  }, [progress]);

  const animatedStyle = useMemo(() => {
    const style: ViewStyle & { opacity?: Animated.AnimatedInterpolation<number> } = {};
    const transforms: object[] = [];

    if (fade) {
      style.opacity = interpolateOpacity(progress);
    }

    if (scale) {
      transforms.push({
        scale: interpolateScale(progress, [0, 1], [0.9, 1]),
      });
    }

    if (slide) {
      switch (slide) {
        case 'up':
          transforms.push({ translateY: interpolateTranslateY(progress, [0, 1], [30, 0]) });
          break;
        case 'down':
          transforms.push({ translateY: interpolateTranslateY(progress, [0, 1], [-30, 0]) });
          break;
        case 'left':
          transforms.push({ translateX: interpolateTranslateX(progress, [0, 1], [30, 0]) });
          break;
        case 'right':
          transforms.push({ translateX: interpolateTranslateX(progress, [0, 1], [-30, 0]) });
          break;
      }
    }

    if (transforms.length > 0) {
      style.transform = transforms as ViewStyle['transform'];
    }

    return style;
  }, [progress, fade, scale, slide]);

  return {
    progress,
    animatedStyle,
    animate,
    animateOut,
    reset,
  };
}

// ===========================================
// VISIBILITY ANIMATION HOOK
// ===========================================

/**
 * Animate visibility changes (show/hide)
 */
export function useVisibilityAnimation(
  visible: boolean,
  options: {
    type?: 'fade' | 'scale' | 'slide';
    direction?: EntranceDirection;
    preset?: SpringPreset | TimingPreset;
    animationType?: 'spring' | 'timing';
  } = {}
) {
  const { type = 'fade', direction = 'up', preset = 'default', animationType = 'spring' } = options;

  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    const animation =
      animationType === 'spring'
        ? withSpring(progress, visible ? 1 : 0, preset as SpringPreset)
        : withTiming(progress, visible ? 1 : 0, preset as TimingPreset);

    animation.start();
  }, [visible, progress, animationType, preset]);

  const animatedStyle = useMemo(() => {
    const style: ViewStyle & { opacity?: Animated.AnimatedInterpolation<number> } = {
      opacity: interpolateOpacity(progress),
    };

    if (type === 'scale') {
      style.transform = [{ scale: interpolateScale(progress, [0, 1], [0.9, 1]) }];
    } else if (type === 'slide') {
      switch (direction) {
        case 'up':
          style.transform = [{ translateY: interpolateTranslateY(progress, [0, 1], [20, 0]) }];
          break;
        case 'down':
          style.transform = [{ translateY: interpolateTranslateY(progress, [0, 1], [-20, 0]) }];
          break;
        case 'left':
          style.transform = [{ translateX: interpolateTranslateX(progress, [0, 1], [20, 0]) }];
          break;
        case 'right':
          style.transform = [{ translateX: interpolateTranslateX(progress, [0, 1], [-20, 0]) }];
          break;
      }
    }

    return style;
  }, [progress, type, direction]);

  return {
    progress,
    animatedStyle,
  };
}

export default {
  // Base hooks
  useAnimatedValue,
  useAnimatedValueXY,

  // Entrance animations
  useFadeIn,
  useSlideIn,
  useScaleIn,
  useZoomIn,
  useCombinedEntrance,

  // Interactive animations
  usePressAnimation,
  useSpring,

  // Effect animations
  useShake,
  usePulse,
  useBreathing,
  useBounce,
  useShimmer,
  useRotation,

  // Stagger animations
  useStaggeredAnimation,

  // Layout animations
  useLayoutAnimation,

  // Visibility animations
  useVisibilityAnimation,
};
