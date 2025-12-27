/**
 * Animation Presets and Utilities
 *
 * Centralized animation configuration for consistent motion across the app.
 * Uses React Native Animated API with native driver for optimal performance.
 *
 * @example
 * import { SpringPresets, TimingPresets, withSpring, sequence } from '@/lib/animations';
 *
 * // Use spring preset
 * Animated.spring(anim, { toValue: 1, ...SpringPresets.bouncy });
 *
 * // Use helper function
 * withSpring(anim, 1, 'gentle').start();
 */

import { Animated, Easing, LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ===========================================
// SPRING PRESETS
// ===========================================

/**
 * Spring animation presets for different use cases
 * All use native driver for 60fps animations
 */
export const SpringPresets = {
  /** Gentle, subtle spring - great for micro-interactions */
  gentle: {
    speed: 14,
    bounciness: 4,
    useNativeDriver: true,
  },
  /** Default spring - balanced for most UI elements */
  default: {
    speed: 12,
    bounciness: 6,
    useNativeDriver: true,
  },
  /** Bouncy spring - playful, attention-grabbing */
  bouncy: {
    speed: 12,
    bounciness: 10,
    useNativeDriver: true,
  },
  /** Stiff spring - quick, responsive feel */
  stiff: {
    speed: 20,
    bounciness: 4,
    useNativeDriver: true,
  },
  /** Slow spring - dramatic entrances */
  slow: {
    speed: 5,
    bounciness: 6,
    useNativeDriver: true,
  },
  /** Quick press feedback */
  press: {
    speed: 50,
    bounciness: 4,
    useNativeDriver: true,
  },
  /** Release after press */
  release: {
    speed: 50,
    bounciness: 8,
    useNativeDriver: true,
  },
  /** Modal/sheet entrance */
  modal: {
    friction: 8,
    tension: 100,
    useNativeDriver: true,
  },
  /** Snappy spring - instant feedback */
  snappy: {
    friction: 10,
    tension: 200,
    useNativeDriver: true,
  },
  /** Wobbly spring - fun, playful */
  wobbly: {
    friction: 3,
    tension: 80,
    useNativeDriver: true,
  },
} as const;

export type SpringPreset = keyof typeof SpringPresets;

// ===========================================
// TIMING PRESETS
// ===========================================

/**
 * Timing animation presets with easing curves
 */
export const TimingPresets = {
  /** Instant feedback (50ms) */
  instant: {
    duration: 50,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  /** Quick transition (100ms) */
  quick: {
    duration: 100,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  /** Fast transition (150ms) */
  fast: {
    duration: 150,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  /** Default transition (200ms) */
  default: {
    duration: 200,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  /** Normal transition (300ms) */
  normal: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  /** Slow, deliberate transition (500ms) */
  slow: {
    duration: 500,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  /** Fade in effect */
  fadeIn: {
    duration: 200,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  },
  /** Fade out effect */
  fadeOut: {
    duration: 150,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  /** Slide entrance */
  slideIn: {
    duration: 300,
    easing: Easing.out(Easing.back(1.5)),
    useNativeDriver: true,
  },
  /** Slide exit */
  slideOut: {
    duration: 250,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  },
  /** Elastic bounce */
  elastic: {
    duration: 400,
    easing: Easing.elastic(1.5),
    useNativeDriver: true,
  },
  /** Overshoot entrance */
  overshoot: {
    duration: 300,
    easing: Easing.out(Easing.back(2)),
    useNativeDriver: true,
  },
} as const;

export type TimingPreset = keyof typeof TimingPresets;

// ===========================================
// EASING CURVES
// ===========================================

/**
 * Common easing curves for custom animations
 */
export const Easings = {
  // Standard curves
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),

  // Cubic curves (smooth)
  cubicIn: Easing.in(Easing.cubic),
  cubicOut: Easing.out(Easing.cubic),
  cubicInOut: Easing.inOut(Easing.cubic),

  // Quad curves (subtle)
  quadIn: Easing.in(Easing.quad),
  quadOut: Easing.out(Easing.quad),
  quadInOut: Easing.inOut(Easing.quad),

  // Back curves (overshoot)
  backIn: Easing.in(Easing.back(1.5)),
  backOut: Easing.out(Easing.back(1.5)),
  backInOut: Easing.inOut(Easing.back(1.5)),

  // Elastic curves (bounce)
  elasticIn: Easing.in(Easing.elastic(1)),
  elasticOut: Easing.out(Easing.elastic(1)),

  // Bounce curves
  bounceIn: Easing.in(Easing.bounce),
  bounceOut: Easing.out(Easing.bounce),

  // Circle curves
  circleIn: Easing.in(Easing.circle),
  circleOut: Easing.out(Easing.circle),

  // Expo curves (dramatic)
  expoIn: Easing.in(Easing.exp),
  expoOut: Easing.out(Easing.exp),
  expoInOut: Easing.inOut(Easing.exp),

  // Bezier curves (custom)
  smooth: Easing.bezier(0.4, 0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0, 1, 1),
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  sharp: Easing.bezier(0.4, 0, 0.6, 1),
} as const;

// ===========================================
// ANIMATION HELPERS
// ===========================================

/**
 * Create a spring animation with preset
 */
export function withSpring(
  value: Animated.Value | Animated.ValueXY,
  toValue: number | { x: number; y: number },
  preset: SpringPreset = 'default'
): Animated.CompositeAnimation {
  return Animated.spring(value, {
    toValue,
    ...SpringPresets[preset],
  });
}

/**
 * Create a timing animation with preset
 */
export function withTiming(
  value: Animated.Value | Animated.ValueXY,
  toValue: number | { x: number; y: number },
  preset: TimingPreset = 'default'
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue,
    ...TimingPresets[preset],
  });
}

/**
 * Create a custom timing animation
 */
export function timing(
  value: Animated.Value,
  toValue: number,
  duration: number,
  easing: (t: number) => number = Easings.easeOut
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
}

/**
 * Run animations in sequence
 */
export function sequence(animations: Animated.CompositeAnimation[]): Animated.CompositeAnimation {
  return Animated.sequence(animations);
}

/**
 * Run animations in parallel
 */
export function parallel(animations: Animated.CompositeAnimation[]): Animated.CompositeAnimation {
  return Animated.parallel(animations);
}

/**
 * Run animations with staggered delays
 */
export function stagger(
  delayMs: number,
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation {
  return Animated.stagger(delayMs, animations);
}

/**
 * Create a looping animation
 */
export function loop(
  animation: Animated.CompositeAnimation,
  iterations: number = -1
): Animated.CompositeAnimation {
  return Animated.loop(animation, { iterations });
}

/**
 * Add a delay before animation
 */
export function delay(ms: number): Animated.CompositeAnimation {
  return Animated.delay(ms);
}

// ===========================================
// INTERPOLATION HELPERS
// ===========================================

/**
 * Create opacity interpolation (0 -> 1)
 */
export function interpolateOpacity(
  value: Animated.Value,
  inputRange: [number, number] = [0, 1]
): Animated.AnimatedInterpolation<number> {
  return value.interpolate({
    inputRange,
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
}

/**
 * Create scale interpolation
 */
export function interpolateScale(
  value: Animated.Value,
  inputRange: [number, number] = [0, 1],
  outputRange: [number, number] = [0, 1]
): Animated.AnimatedInterpolation<number> {
  return value.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
}

/**
 * Create rotation interpolation
 */
export function interpolateRotation(
  value: Animated.Value,
  inputRange: [number, number] = [0, 1],
  outputRange: [string, string] = ['0deg', '360deg']
): Animated.AnimatedInterpolation<string> {
  return value.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
}

/**
 * Create translateY interpolation
 */
export function interpolateTranslateY(
  value: Animated.Value,
  inputRange: [number, number] = [0, 1],
  outputRange: [number, number] = [50, 0]
): Animated.AnimatedInterpolation<number> {
  return value.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
}

/**
 * Create translateX interpolation
 */
export function interpolateTranslateX(
  value: Animated.Value,
  inputRange: [number, number] = [0, 1],
  outputRange: [number, number] = [50, 0]
): Animated.AnimatedInterpolation<number> {
  return value.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
}

/**
 * Create color interpolation
 */
export function interpolateColor(
  value: Animated.Value,
  inputRange: number[],
  outputRange: string[]
): Animated.AnimatedInterpolation<string> {
  return value.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
}

// ===========================================
// ENTRANCE ANIMATIONS
// ===========================================

export type EntranceDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Get animated styles for fade-in entrance
 */
export function fadeInStyle(progress: Animated.Value) {
  return {
    opacity: progress,
  };
}

/**
 * Get animated styles for slide entrance
 */
export function slideInStyle(
  progress: Animated.Value,
  direction: EntranceDirection = 'up',
  distance: number = 50
) {
  const transforms: { [key in EntranceDirection]: object } = {
    up: {
      translateY: interpolateTranslateY(progress, [0, 1], [distance, 0]),
    },
    down: {
      translateY: interpolateTranslateY(progress, [0, 1], [-distance, 0]),
    },
    left: {
      translateX: interpolateTranslateX(progress, [0, 1], [distance, 0]),
    },
    right: {
      translateX: interpolateTranslateX(progress, [0, 1], [-distance, 0]),
    },
  };

  return {
    opacity: progress,
    transform: [transforms[direction]],
  };
}

/**
 * Get animated styles for scale entrance
 */
export function scaleInStyle(progress: Animated.Value, startScale: number = 0.8) {
  return {
    opacity: progress,
    transform: [
      {
        scale: interpolateScale(progress, [0, 1], [startScale, 1]),
      },
    ],
  };
}

/**
 * Get animated styles for zoom entrance (scale from center)
 */
export function zoomInStyle(progress: Animated.Value) {
  return {
    opacity: progress,
    transform: [
      {
        scale: interpolateScale(progress, [0, 1], [0, 1]),
      },
    ],
  };
}

/**
 * Get animated styles for flip entrance
 */
export function flipInStyle(progress: Animated.Value, axis: 'x' | 'y' = 'y') {
  const rotation = interpolateRotation(progress, [0, 1], ['90deg', '0deg']);

  return {
    opacity: progress,
    transform: [axis === 'y' ? { rotateY: rotation } : { rotateX: rotation }],
  };
}

// ===========================================
// SHIMMER / PULSE ANIMATIONS
// ===========================================

/**
 * Create a shimmer animation for skeleton loading
 */
export function createShimmerAnimation(
  value: Animated.Value,
  duration: number = 1200
): Animated.CompositeAnimation {
  return loop(
    sequence([
      Animated.timing(value, {
        toValue: 1,
        duration: duration / 2,
        easing: Easings.easeInOut,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration: duration / 2,
        easing: Easings.easeInOut,
        useNativeDriver: true,
      }),
    ])
  );
}

/**
 * Create a pulse animation
 */
export function createPulseAnimation(
  value: Animated.Value,
  minScale: number = 0.95,
  maxScale: number = 1.05,
  duration: number = 1000
): Animated.CompositeAnimation {
  return loop(
    sequence([withSpring(value, maxScale, 'gentle'), withSpring(value, minScale, 'gentle')])
  );
}

/**
 * Create a breathing animation (subtle scale pulse)
 */
export function createBreathingAnimation(
  value: Animated.Value,
  duration: number = 2000
): Animated.CompositeAnimation {
  return loop(
    sequence([
      Animated.timing(value, {
        toValue: 1.02,
        duration: duration / 2,
        easing: Easings.easeInOut,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: duration / 2,
        easing: Easings.easeInOut,
        useNativeDriver: true,
      }),
    ])
  );
}

/**
 * Create a shake animation (for error feedback)
 */
export function createShakeAnimation(
  value: Animated.Value,
  intensity: number = 10
): Animated.CompositeAnimation {
  return sequence([
    Animated.timing(value, { toValue: intensity, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: -intensity, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: intensity * 0.7, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: -intensity * 0.7, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: intensity * 0.4, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]);
}

/**
 * Create a bounce animation
 */
export function createBounceAnimation(
  value: Animated.Value,
  height: number = -20
): Animated.CompositeAnimation {
  return sequence([
    Animated.timing(value, {
      toValue: height,
      duration: 150,
      easing: Easings.easeOut,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: 150,
      easing: Easings.bounceOut,
      useNativeDriver: true,
    }),
  ]);
}

// ===========================================
// LAYOUT ANIMATION PRESETS
// ===========================================

/**
 * Layout animation presets for list changes, additions, removals
 */
export const LayoutAnimationPresets = {
  /** Default spring layout animation */
  spring: LayoutAnimation.Presets.spring,

  /** Linear layout animation */
  linear: LayoutAnimation.Presets.linear,

  /** Ease in/out layout animation */
  easeInEaseOut: LayoutAnimation.Presets.easeInEaseOut,

  /** Quick layout animation for snappy updates */
  quick: {
    duration: 150,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  },

  /** Gentle fade for list items */
  fade: {
    duration: 200,
    create: {
      type: LayoutAnimation.Types.easeIn,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeOut,
      property: LayoutAnimation.Properties.opacity,
    },
  },

  /** Scale in/out for items */
  scale: {
    duration: 250,
    create: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.scaleXY,
      springDamping: 0.7,
    },
    update: {
      type: LayoutAnimation.Types.spring,
      springDamping: 0.7,
    },
    delete: {
      type: LayoutAnimation.Types.easeOut,
      property: LayoutAnimation.Properties.scaleXY,
    },
  },

  /** Smooth height transitions */
  height: {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  },
} as const;

export type LayoutAnimationPreset = keyof typeof LayoutAnimationPresets;

/**
 * Apply a layout animation preset before state update
 */
export function animateLayout(preset: LayoutAnimationPreset = 'spring'): void {
  LayoutAnimation.configureNext(LayoutAnimationPresets[preset]);
}

/**
 * Apply layout animation with custom config
 */
export function animateLayoutCustom(
  config: Parameters<typeof LayoutAnimation.configureNext>[0]
): void {
  LayoutAnimation.configureNext(config);
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Create multiple animated values at once
 */
export function createAnimatedValues(count: number, initialValue: number = 0): Animated.Value[] {
  return Array.from({ length: count }, () => new Animated.Value(initialValue));
}

/**
 * Reset an animated value without animation
 */
export function resetValue(value: Animated.Value, to: number = 0): void {
  value.setValue(to);
}

/**
 * Stop all running animations on a value
 */
export function stopAnimation(value: Animated.Value): void {
  value.stopAnimation();
}

/**
 * Get the current value (async)
 */
export function getCurrentValue(value: Animated.Value): Promise<number> {
  return new Promise((resolve) => {
    value.stopAnimation((v) => resolve(v));
  });
}

/**
 * Create a derived animated value that tracks another
 */
export function createDerivedValue(
  source: Animated.Value,
  transform: (value: number) => number
): Animated.Value {
  const derived = new Animated.Value(0);

  source.addListener(({ value }) => {
    derived.setValue(transform(value));
  });

  return derived;
}

// ===========================================
// EXPORTS
// ===========================================

export default {
  // Presets
  SpringPresets,
  TimingPresets,
  Easings,
  LayoutAnimationPresets,

  // Animation creators
  withSpring,
  withTiming,
  timing,
  sequence,
  parallel,
  stagger,
  loop,
  delay,

  // Interpolations
  interpolateOpacity,
  interpolateScale,
  interpolateRotation,
  interpolateTranslateX,
  interpolateTranslateY,
  interpolateColor,

  // Entrance styles
  fadeInStyle,
  slideInStyle,
  scaleInStyle,
  zoomInStyle,
  flipInStyle,

  // Effect animations
  createShimmerAnimation,
  createPulseAnimation,
  createBreathingAnimation,
  createShakeAnimation,
  createBounceAnimation,

  // Layout animations
  animateLayout,
  animateLayoutCustom,

  // Utilities
  createAnimatedValues,
  resetValue,
  stopAnimation,
  getCurrentValue,
  createDerivedValue,
};
