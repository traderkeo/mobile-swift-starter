/**
 * Animated Components
 *
 * Ready-to-use animated wrapper components for common animation patterns.
 * Wrap any component to add animations without writing animation code.
 *
 * @example
 * import {
 *   AnimatedView,
 *   FadeIn,
 *   SlideIn,
 *   ScaleIn,
 *   Stagger,
 *   AnimatedPresence,
 * } from '@/components/ui';
 *
 * // Simple fade in
 * <FadeIn>
 *   <Text>Hello</Text>
 * </FadeIn>
 *
 * // Slide in from left with delay
 * <SlideIn direction="left" delay={200}>
 *   <Card>Content</Card>
 * </SlideIn>
 *
 * // Staggered list items
 * <Stagger staggerDelay={100}>
 *   {items.map((item) => (
 *     <ListItem key={item.id} {...item} />
 *   ))}
 * </Stagger>
 */

import React, { useEffect, useRef, Children, cloneElement, isValidElement } from 'react';
import { Animated, ViewStyle, StyleProp, View } from 'react-native';
import {
  useFadeIn,
  useSlideIn,
  useScaleIn,
  useZoomIn,
  usePulse,
  useShake,
  useBounce,
  useShimmer,
  useRotation,
  useCombinedEntrance,
  useStaggeredAnimation,
  useVisibilityAnimation,
} from '@/hooks/use-animation';
import type { SpringPreset, TimingPreset, EntranceDirection } from '@/lib/animations';

// ===========================================
// ANIMATED VIEW (Base)
// ===========================================

interface AnimatedViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  animatedStyle?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Base animated view component
 */
export function AnimatedView({ children, style, animatedStyle, className }: AnimatedViewProps) {
  return (
    <Animated.View style={[style, animatedStyle]} className={className}>
      {children}
    </Animated.View>
  );
}

// ===========================================
// FADE IN
// ===========================================

interface FadeInProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Duration of animation */
  duration?: number;
  /** Animation preset */
  preset?: TimingPreset;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

/**
 * Fade in animation wrapper
 */
export function FadeIn({
  children,
  style,
  className,
  delay = 0,
  preset = 'fadeIn',
  onAnimationComplete,
}: FadeInProps) {
  const { animatedStyle, animate } = useFadeIn({
    type: 'timing',
    preset,
    delay,
  });

  useEffect(() => {
    animate(onAnimationComplete);
  }, [animate, onAnimationComplete]);

  return (
    <Animated.View style={[style, animatedStyle]} className={className}>
      {children}
    </Animated.View>
  );
}

// ===========================================
// SLIDE IN
// ===========================================

interface SlideInProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Direction to slide from */
  direction?: EntranceDirection;
  /** Distance to slide (px) */
  distance?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation preset */
  preset?: SpringPreset;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

/**
 * Slide in animation wrapper
 */
export function SlideIn({
  children,
  style,
  className,
  direction = 'up',
  distance = 50,
  delay = 0,
  preset = 'default',
  onAnimationComplete,
}: SlideInProps) {
  const { animatedStyle, animate } = useSlideIn(direction, {
    type: 'spring',
    preset,
    delay,
    distance,
  });

  useEffect(() => {
    animate(onAnimationComplete);
  }, [animate, onAnimationComplete]);

  return (
    <Animated.View style={[style, animatedStyle]} className={className}>
      {children}
    </Animated.View>
  );
}

// ===========================================
// SCALE IN
// ===========================================

interface ScaleInProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Starting scale (0-1) */
  startScale?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation preset */
  preset?: SpringPreset;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

/**
 * Scale in animation wrapper
 */
export function ScaleIn({
  children,
  style,
  className,
  startScale = 0.8,
  delay = 0,
  preset = 'bouncy',
  onAnimationComplete,
}: ScaleInProps) {
  const { animatedStyle, animate } = useScaleIn({
    type: 'spring',
    preset,
    delay,
    startScale,
  });

  useEffect(() => {
    animate(onAnimationComplete);
  }, [animate, onAnimationComplete]);

  return (
    <Animated.View style={[style, animatedStyle]} className={className}>
      {children}
    </Animated.View>
  );
}

// ===========================================
// ZOOM IN
// ===========================================

interface ZoomInProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation preset */
  preset?: SpringPreset;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

/**
 * Zoom in from center animation wrapper
 */
export function ZoomIn({
  children,
  style,
  className,
  delay = 0,
  preset = 'bouncy',
  onAnimationComplete,
}: ZoomInProps) {
  const { animatedStyle, animate } = useZoomIn({
    type: 'spring',
    preset,
    delay,
  });

  useEffect(() => {
    animate(onAnimationComplete);
  }, [animate, onAnimationComplete]);

  return (
    <Animated.View style={[style, animatedStyle]} className={className}>
      {children}
    </Animated.View>
  );
}

// ===========================================
// COMBINED ENTRANCE
// ===========================================

interface EntranceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Enable fade */
  fade?: boolean;
  /** Slide direction */
  slide?: EntranceDirection;
  /** Enable scale */
  scale?: boolean;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation preset */
  preset?: SpringPreset;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

/**
 * Combined entrance animation (fade + slide + scale)
 */
export function Entrance({
  children,
  style,
  className,
  fade = true,
  slide,
  scale = false,
  delay = 0,
  preset = 'default',
  onAnimationComplete,
}: EntranceProps) {
  const { animatedStyle, animate } = useCombinedEntrance({
    fade,
    slide,
    scale,
    delay,
    preset,
  });

  useEffect(() => {
    animate(onAnimationComplete);
  }, [animate, onAnimationComplete]);

  return (
    <Animated.View style={[style, animatedStyle]} className={className}>
      {children}
    </Animated.View>
  );
}

// ===========================================
// STAGGER
// ===========================================

interface StaggerProps {
  children: React.ReactNode;
  /** Delay between each child animation (ms) */
  staggerDelay?: number;
  /** Animation preset */
  preset?: SpringPreset;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Container className */
  className?: string;
}

/**
 * Staggered animation for list of children
 */
export function Stagger({
  children,
  staggerDelay = 50,
  preset = 'default',
  style,
  className,
}: StaggerProps) {
  const childArray = Children.toArray(children);
  const { animate, getItemStyle } = useStaggeredAnimation(childArray.length, {
    staggerDelay,
    preset,
    type: 'spring',
  });

  useEffect(() => {
    animate();
  }, [animate]);

  return (
    <View style={style} className={className}>
      {childArray.map((child, index) => (
        <Animated.View key={index} style={getItemStyle(index)}>
          {child}
        </Animated.View>
      ))}
    </View>
  );
}

// ===========================================
// ANIMATED PRESENCE
// ===========================================

interface AnimatedPresenceProps {
  children: React.ReactNode;
  /** Whether the content is visible */
  visible: boolean;
  /** Animation type */
  type?: 'fade' | 'scale' | 'slide';
  /** Slide direction (only for type="slide") */
  direction?: EntranceDirection;
  /** Animation preset */
  preset?: SpringPreset | TimingPreset;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Container className */
  className?: string;
}

/**
 * Animate presence/absence of children
 */
export function AnimatedPresence({
  children,
  visible,
  type = 'fade',
  direction = 'up',
  preset = 'default',
  style,
  className,
}: AnimatedPresenceProps) {
  const { animatedStyle } = useVisibilityAnimation(visible, {
    type,
    direction,
    preset,
    animationType: 'spring',
  });

  return (
    <Animated.View
      style={[style, animatedStyle]}
      className={className}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {children}
    </Animated.View>
  );
}

// ===========================================
// PULSE
// ===========================================

interface PulseProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Minimum scale during pulse */
  minScale?: number;
  /** Maximum scale during pulse */
  maxScale?: number;
  /** Auto-start animation */
  autoPlay?: boolean;
}

/**
 * Pulsing animation wrapper (attention-grabbing)
 */
export function Pulse({
  children,
  style,
  className,
  minScale = 0.95,
  maxScale = 1.05,
  autoPlay = true,
}: PulseProps) {
  const { animatedStyle } = usePulse({ minScale, maxScale, autoPlay });

  return (
    <Animated.View style={[style, animatedStyle]} className={className}>
      {children}
    </Animated.View>
  );
}

// ===========================================
// SHIMMER
// ===========================================

interface ShimmerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Animation duration (ms) */
  duration?: number;
  /** Auto-start animation */
  autoPlay?: boolean;
}

/**
 * Shimmer animation wrapper (loading states)
 */
export function Shimmer({
  children,
  style,
  className,
  duration = 1200,
  autoPlay = true,
}: ShimmerProps) {
  const { animatedStyle } = useShimmer({ duration, autoPlay });

  return (
    <Animated.View style={[style, animatedStyle]} className={className}>
      {children}
    </Animated.View>
  );
}

// ===========================================
// ROTATING
// ===========================================

interface RotatingProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Animation duration for one rotation (ms) */
  duration?: number;
  /** Auto-start animation */
  autoPlay?: boolean;
}

/**
 * Continuous rotation animation wrapper
 */
export function Rotating({
  children,
  style,
  className,
  duration = 1000,
  autoPlay = true,
}: RotatingProps) {
  const { animatedStyle } = useRotation({ duration, loop: true, autoPlay });

  return (
    <Animated.View style={[style, animatedStyle]} className={className}>
      {children}
    </Animated.View>
  );
}

// ===========================================
// SHAKE (IMPERATIVE)
// ===========================================

export interface ShakeRef {
  shake: (callback?: () => void) => void;
}

interface ShakeableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Shake intensity (px) */
  intensity?: number;
  /** Reference to trigger shake imperatively */
  shakeRef?: React.RefObject<ShakeRef>;
}

/**
 * Shakeable wrapper (trigger via ref for error feedback)
 *
 * @example
 * const shakeRef = useRef<ShakeRef>(null);
 *
 * <Shakeable shakeRef={shakeRef}>
 *   <Input />
 * </Shakeable>
 *
 * // Trigger shake
 * shakeRef.current?.shake();
 */
export function Shakeable({
  children,
  style,
  className,
  intensity = 10,
  shakeRef,
}: ShakeableProps) {
  const { animatedStyle, shake } = useShake(intensity);

  useEffect(() => {
    if (shakeRef) {
      (shakeRef as React.MutableRefObject<ShakeRef>).current = { shake };
    }
  }, [shakeRef, shake]);

  return (
    <Animated.View style={[style, animatedStyle]} className={className}>
      {children}
    </Animated.View>
  );
}

// ===========================================
// BOUNCE (IMPERATIVE)
// ===========================================

export interface BounceRef {
  bounce: (callback?: () => void) => void;
}

interface BouncyProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** Bounce height (px, negative = up) */
  height?: number;
  /** Reference to trigger bounce imperatively */
  bounceRef?: React.RefObject<BounceRef>;
}

/**
 * Bouncy wrapper (trigger via ref)
 *
 * @example
 * const bounceRef = useRef<BounceRef>(null);
 *
 * <Bouncy bounceRef={bounceRef}>
 *   <Button />
 * </Bouncy>
 *
 * // Trigger bounce
 * bounceRef.current?.bounce();
 */
export function Bouncy({ children, style, className, height = -20, bounceRef }: BouncyProps) {
  const { animatedStyle, bounce } = useBounce(height);

  useEffect(() => {
    if (bounceRef) {
      (bounceRef as React.MutableRefObject<BounceRef>).current = { bounce };
    }
  }, [bounceRef, bounce]);

  return (
    <Animated.View style={[style, animatedStyle]} className={className}>
      {children}
    </Animated.View>
  );
}

// ===========================================
// DELAYED RENDER
// ===========================================

interface DelayedRenderProps {
  children: React.ReactNode;
  /** Delay before rendering (ms) */
  delay: number;
  /** Placeholder while waiting */
  placeholder?: React.ReactNode;
}

/**
 * Delay rendering of children
 */
export function DelayedRender({ children, delay, placeholder = null }: DelayedRenderProps) {
  const [show, setShow] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return <>{placeholder}</>;

  return <>{children}</>;
}

// ===========================================
// ANIMATED LIST ITEM
// ===========================================

interface AnimatedListItemProps {
  children: React.ReactNode;
  /** Index in the list (for stagger calculation) */
  index: number;
  /** Base delay before animation starts */
  baseDelay?: number;
  /** Delay between items */
  staggerDelay?: number;
  /** Animation type */
  type?: 'fade' | 'slide' | 'scale';
  /** Slide direction */
  direction?: EntranceDirection;
  /** Animation preset */
  preset?: SpringPreset;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Container className */
  className?: string;
}

/**
 * Animated list item with stagger support
 */
export function AnimatedListItem({
  children,
  index,
  baseDelay = 0,
  staggerDelay = 50,
  type = 'slide',
  direction = 'up',
  preset = 'default',
  style,
  className,
}: AnimatedListItemProps) {
  const delay = baseDelay + index * staggerDelay;

  if (type === 'slide') {
    return (
      <SlideIn
        direction={direction}
        delay={delay}
        preset={preset}
        style={style}
        className={className}
      >
        {children}
      </SlideIn>
    );
  }

  if (type === 'scale') {
    return (
      <ScaleIn delay={delay} preset={preset} style={style} className={className}>
        {children}
      </ScaleIn>
    );
  }

  return (
    <FadeIn delay={delay} style={style} className={className}>
      {children}
    </FadeIn>
  );
}

// ===========================================
// EXPORTS
// ===========================================

export default {
  AnimatedView,
  FadeIn,
  SlideIn,
  ScaleIn,
  ZoomIn,
  Entrance,
  Stagger,
  AnimatedPresence,
  Pulse,
  Shimmer,
  Rotating,
  Shakeable,
  Bouncy,
  DelayedRender,
  AnimatedListItem,
};
