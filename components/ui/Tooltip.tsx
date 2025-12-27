/**
 * Tooltip Component
 *
 * Contextual hints and information displayed on press/long-press.
 *
 * @example
 * // Basic tooltip
 * <Tooltip content="This is helpful information">
 *   <IconButton icon="help-circle" />
 * </Tooltip>
 *
 * // Tooltip with custom positioning
 * <Tooltip content="Positioned above" position="top">
 *   <Button>Hover me</Button>
 * </Tooltip>
 *
 * // Rich content tooltip
 * <Tooltip
 *   content={
 *     <View>
 *       <Text className="font-bold">Pro Tip</Text>
 *       <Text>You can do this faster!</Text>
 *     </View>
 *   }
 * >
 *   <InfoIcon />
 * </Tooltip>
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  type ViewStyle,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Extended layout type that includes page coordinates from measureInWindow
interface TargetLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

// ===========================================
// TYPES
// ===========================================

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type TooltipVariant = 'dark' | 'light';

export interface TooltipProps {
  content: React.ReactNode | string;
  children: React.ReactNode;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  delay?: number;
  showOnLongPress?: boolean;
  maxWidth?: number;
  className?: string;
  contentClassName?: string;
  style?: ViewStyle;
  testID?: string;
}

// ===========================================
// CONSTANTS
// ===========================================

const TOOLTIP_OFFSET = 8;
const ARROW_SIZE = 6;
const SCREEN_PADDING = 16;

// ===========================================
// MAIN TOOLTIP COMPONENT
// ===========================================

export function Tooltip({
  content,
  children,
  position = 'top',
  variant = 'dark',
  delay = 0,
  showOnLongPress = false,
  maxWidth = 250,
  className = '',
  contentClassName = '',
  style,
  testID,
}: TooltipProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [visible, setVisible] = useState(false);
  const [targetLayout, setTargetLayout] = useState<TargetLayout | null>(null);
  const [tooltipLayout, setTooltipLayout] = useState<{ width: number; height: number } | null>(
    null
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const targetRef = useRef<View>(null);
  const delayTimer = useRef<NodeJS.Timeout | null>(null);

  // Determine actual position based on screen space
  const getActualPosition = useCallback((): TooltipPosition => {
    if (position !== 'auto' || !targetLayout) return position;

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const { pageX, pageY, height } = targetLayout;

    // Check available space in each direction
    const spaceTop = pageY;
    const spaceBottom = screenHeight - pageY - height;
    const spaceLeft = pageX;
    const spaceRight = screenWidth - pageX;

    if (spaceTop > 100) return 'top';
    if (spaceBottom > 100) return 'bottom';
    if (spaceRight > 150) return 'right';
    if (spaceLeft > 150) return 'left';
    return 'top';
  }, [position, targetLayout]);

  // Calculate tooltip position
  const getTooltipPosition = useCallback((): ViewStyle => {
    if (!targetLayout || !tooltipLayout) return {};

    const screenWidth = Dimensions.get('window').width;
    const actualPosition = getActualPosition();
    const { pageX, pageY, width, height } = targetLayout;
    const { width: tooltipWidth, height: tooltipHeight } = tooltipLayout;

    let top = 0;
    let left = 0;

    switch (actualPosition) {
      case 'top':
        top = pageY - tooltipHeight - TOOLTIP_OFFSET;
        left = pageX + width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = pageY + height + TOOLTIP_OFFSET;
        left = pageX + width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = pageY + height / 2 - tooltipHeight / 2;
        left = pageX - tooltipWidth - TOOLTIP_OFFSET;
        break;
      case 'right':
        top = pageY + height / 2 - tooltipHeight / 2;
        left = pageX + width + TOOLTIP_OFFSET;
        break;
    }

    // Keep tooltip within screen bounds
    left = Math.max(SCREEN_PADDING, Math.min(left, screenWidth - tooltipWidth - SCREEN_PADDING));

    return { position: 'absolute', top, left };
  }, [targetLayout, tooltipLayout, getActualPosition]);

  // Get arrow position
  const getArrowStyle = useCallback((): ViewStyle => {
    const actualPosition = getActualPosition();
    const baseStyle: ViewStyle = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    const bgColor = variant === 'dark' ? '#1f2937' : isDark ? '#374151' : '#ffffff';

    switch (actualPosition) {
      case 'top':
        return {
          ...baseStyle,
          bottom: -ARROW_SIZE,
          alignSelf: 'center',
          borderLeftWidth: ARROW_SIZE,
          borderRightWidth: ARROW_SIZE,
          borderTopWidth: ARROW_SIZE,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: bgColor,
        };
      case 'bottom':
        return {
          ...baseStyle,
          top: -ARROW_SIZE,
          alignSelf: 'center',
          borderLeftWidth: ARROW_SIZE,
          borderRightWidth: ARROW_SIZE,
          borderBottomWidth: ARROW_SIZE,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: bgColor,
        };
      case 'left':
        return {
          ...baseStyle,
          right: -ARROW_SIZE,
          alignSelf: 'center',
          borderTopWidth: ARROW_SIZE,
          borderBottomWidth: ARROW_SIZE,
          borderLeftWidth: ARROW_SIZE,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: bgColor,
        };
      case 'right':
        return {
          ...baseStyle,
          left: -ARROW_SIZE,
          alignSelf: 'center',
          borderTopWidth: ARROW_SIZE,
          borderBottomWidth: ARROW_SIZE,
          borderRightWidth: ARROW_SIZE,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: bgColor,
        };
      default:
        return baseStyle;
    }
  }, [getActualPosition, variant, isDark]);

  const show = useCallback(() => {
    targetRef.current?.measureInWindow((x, y, width, height) => {
      setTargetLayout({ x, y, width, height, pageX: x, pageY: y });
    });

    if (delay > 0) {
      delayTimer.current = setTimeout(() => {
        setVisible(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      }, delay);
    } else {
      setVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [delay, fadeAnim]);

  const hide = useCallback(() => {
    if (delayTimer.current) {
      clearTimeout(delayTimer.current);
    }
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  }, [fadeAnim]);

  const handlePress = showOnLongPress ? undefined : show;
  const handleLongPress = showOnLongPress ? show : undefined;

  const bgClass =
    variant === 'dark' ? 'bg-gray-800' : isDark ? 'bg-gray-700' : 'bg-white border border-border';

  const textClass = variant === 'dark' ? 'text-white' : isDark ? 'text-white' : 'text-foreground';

  return (
    <>
      <TouchableOpacity
        ref={targetRef}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressOut={hide}
        activeOpacity={0.8}
        className={className}
        style={style}
        testID={testID}
      >
        {children}
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="none" onRequestClose={hide}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={hide}>
          <Animated.View
            style={[getTooltipPosition(), { opacity: fadeAnim, maxWidth }]}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              if (
                !tooltipLayout ||
                tooltipLayout.width !== width ||
                tooltipLayout.height !== height
              ) {
                setTooltipLayout({ width, height });
              }
            }}
          >
            <View className={`px-3 py-2 rounded-lg shadow-lg ${bgClass} ${contentClassName}`}>
              {typeof content === 'string' ? (
                <Text className={`text-sm ${textClass}`}>{content}</Text>
              ) : (
                content
              )}
            </View>
            <View style={getArrowStyle()} />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * InfoTooltip - Tooltip with info icon trigger
 */
export interface InfoTooltipProps extends Omit<TooltipProps, 'children'> {
  size?: number;
  color?: string;
}

export function InfoTooltip({ size = 18, color, ...props }: InfoTooltipProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = color || (isDark ? '#9ca3af' : '#6b7280');

  return (
    <Tooltip {...props}>
      <View className="p-1">
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isDark ? '#374151' : '#e5e7eb',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: size * 0.7, fontWeight: '600', color: iconColor }}>?</Text>
        </View>
      </View>
    </Tooltip>
  );
}

/**
 * HelpTooltip - Tooltip styled for help text
 */
export function HelpTooltip(props: TooltipProps) {
  return <Tooltip variant="light" position="bottom" {...props} />;
}
