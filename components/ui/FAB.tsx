/**
 * FAB (Floating Action Button) Component
 *
 * Prominent button for primary actions, floating above content.
 * Supports expanded labels, multiple actions, and positioning.
 *
 * @example
 * // Basic FAB
 * <FAB icon="add" onPress={handleCreate} />
 *
 * // Extended FAB with label
 * <FAB icon="add" label="Create" onPress={handleCreate} />
 *
 * // Different positions
 * <FAB icon="add" position="bottom-left" onPress={handlePress} />
 *
 * // Different colors
 * <FAB icon="add" color="success" onPress={handlePress} />
 *
 * // Mini size
 * <FAB icon="arrow-up" size="mini" onPress={scrollToTop} />
 *
 * // Speed dial (expandable FAB)
 * <SpeedDial
 *   icon="add"
 *   actions={[
 *     { icon: 'camera', label: 'Camera', onPress: openCamera },
 *     { icon: 'image', label: 'Gallery', onPress: openGallery },
 *     { icon: 'document', label: 'File', onPress: openFiles },
 *   ]}
 * />
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Text } from './Text';

// Local color constants for FAB variants (match tailwind.config.js)
const FAB_COLORS: Record<string, string> = {
  primary: '#0a7ea4',
  secondary: '#6b7280',
  accent: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

// ===========================================
// TYPES
// ===========================================

export type FABPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'top-right'
  | 'top-left';
export type FABSize = 'mini' | 'small' | 'regular' | 'large';
export type FABColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface FABProps {
  /** Icon name */
  icon: keyof typeof Ionicons.glyphMap;
  /** Optional label for extended FAB */
  label?: string;
  /** Press handler */
  onPress: () => void;
  /** Position on screen */
  position?: FABPosition;
  /** Size variant */
  size?: FABSize;
  /** Color */
  color?: FABColor;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Visible state (for animations) */
  visible?: boolean;
  /** Custom className */
  className?: string;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

interface SizeConfig {
  size: number;
  iconSize: number;
  extendedPadding: number;
  labelSize: 'sm' | 'base';
}

const sizeConfigs: Record<FABSize, SizeConfig> = {
  mini: { size: 40, iconSize: 20, extendedPadding: 12, labelSize: 'sm' },
  small: { size: 48, iconSize: 22, extendedPadding: 14, labelSize: 'sm' },
  regular: { size: 56, iconSize: 24, extendedPadding: 16, labelSize: 'base' },
  large: { size: 64, iconSize: 28, extendedPadding: 20, labelSize: 'base' },
};

// ===========================================
// POSITION STYLES
// ===========================================

const getPositionStyle = (position: FABPosition) => {
  const base = { position: 'absolute' as const };
  switch (position) {
    case 'bottom-right':
      return { ...base, bottom: 24, right: 24 };
    case 'bottom-left':
      return { ...base, bottom: 24, left: 24 };
    case 'bottom-center':
      return { ...base, bottom: 24, alignSelf: 'center' as const, left: 0, right: 0 };
    case 'top-right':
      return { ...base, top: 24, right: 24 };
    case 'top-left':
      return { ...base, top: 24, left: 24 };
    default:
      return { ...base, bottom: 24, right: 24 };
  }
};

// ===========================================
// COMPONENT
// ===========================================

export function FAB({
  icon,
  label,
  onPress,
  position = 'bottom-right',
  size = 'regular',
  color = 'primary',
  disabled = false,
  loading = false,
  visible = true,
  className = '',
}: FABProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfigs[size];
  const colorValue = FAB_COLORS[color] || FAB_COLORS.primary;

  // Animations
  const scaleAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Visibility animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [visible, scaleAnim]);

  // Press animation
  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(pressAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [pressAnim, rotateAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(pressAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [pressAnim, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const isExtended = !!label;
  const positionStyle = getPositionStyle(position);

  return (
    <Animated.View
      style={[
        positionStyle,
        {
          transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }],
          alignItems: position === 'bottom-center' ? 'center' : undefined,
        },
      ]}
      className={className}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[
          styles.shadow,
          {
            height: config.size,
            minWidth: config.size,
            borderRadius: config.size / 2,
            backgroundColor: disabled ? (isDark ? '#374151' : '#D1D5DB') : colorValue,
            paddingHorizontal: isExtended ? config.extendedPadding : 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {loading ? (
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="sync" size={config.iconSize} color="#FFFFFF" />
          </Animated.View>
        ) : (
          <>
            <Ionicons name={icon} size={config.iconSize} color="#FFFFFF" />
            {label && (
              <Text size={config.labelSize} weight="semibold" color="white" className="ml-2">
                {label}
              </Text>
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ===========================================
// SPEED DIAL COMPONENT
// ===========================================

export interface SpeedDialAction {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress: () => void;
  color?: FABColor;
}

export interface SpeedDialProps {
  /** Main icon (changes to X when open) */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Actions to display */
  actions: SpeedDialAction[];
  /** Position */
  position?: FABPosition;
  /** Color */
  color?: FABColor;
  /** Custom className */
  className?: string;
}

export function SpeedDial({
  icon = 'add',
  actions,
  position = 'bottom-right',
  color = 'primary',
  className = '',
}: SpeedDialProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colorValue = FAB_COLORS[color] || FAB_COLORS.primary;

  // Animations
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const actionAnims = useRef(actions.map(() => new Animated.Value(0))).current;

  const toggleOpen = () => {
    const toValue = isOpen ? 0 : 1;

    // Rotate main button
    Animated.spring(rotateAnim, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();

    // Backdrop
    Animated.timing(backdropAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Stagger action buttons
    Animated.stagger(
      50,
      actionAnims.map((anim) =>
        Animated.spring(anim, {
          toValue,
          useNativeDriver: true,
          friction: 8,
          tension: 100,
        })
      )
    ).start();

    setIsOpen(!isOpen);
  };

  const handleActionPress = (action: SpeedDialAction) => {
    toggleOpen();
    setTimeout(() => action.onPress(), 200);
  };

  const mainRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const positionStyle = getPositionStyle(position);
  const isLeft = position.includes('left');

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
            opacity: backdropAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={toggleOpen}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Actions */}
      <View
        style={[positionStyle, { alignItems: isLeft ? 'flex-start' : 'flex-end' }]}
        className={className}
      >
        {actions.map((action, index) => {
          const actionColor = FAB_COLORS[action.color || 'secondary'] || '#6B7280';
          const reverseIndex = actions.length - 1 - index;

          return (
            <Animated.View
              key={index}
              style={{
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                opacity: actionAnims[reverseIndex],
                transform: [
                  {
                    translateY: actionAnims[reverseIndex].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                  {
                    scale: actionAnims[reverseIndex],
                  },
                ],
              }}
            >
              {/* Label (on left for right-positioned, vice versa) */}
              {action.label && !isLeft && (
                <View
                  className="mr-3 px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }}
                >
                  <Text size="sm" weight="medium">
                    {action.label}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => handleActionPress(action)}
                style={[
                  styles.miniShadow,
                  {
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: actionColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <Ionicons name={action.icon} size={22} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Label (on right for left-positioned) */}
              {action.label && isLeft && (
                <View
                  className="ml-3 px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }}
                >
                  <Text size="sm" weight="medium">
                    {action.label}
                  </Text>
                </View>
              )}
            </Animated.View>
          );
        })}

        {/* Main FAB */}
        <TouchableOpacity
          onPress={toggleOpen}
          activeOpacity={0.9}
          style={[
            styles.shadow,
            {
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colorValue,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: mainRotation }] }}>
            <Ionicons name={icon} size={24} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}

// ===========================================
// STYLES
// ===========================================

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  miniShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
