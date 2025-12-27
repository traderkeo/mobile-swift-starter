/**
 * Slider component for range selection, volume controls, and rating inputs
 *
 * Usage:
 * ```tsx
 * // Basic slider
 * <Slider value={50} onValueChange={setValue} />
 *
 * // With min/max and step
 * <Slider value={value} min={0} max={100} step={5} onValueChange={setValue} />
 *
 * // With labels
 * <Slider value={value} showValue label="Volume" onValueChange={setValue} />
 *
 * // Range slider
 * <RangeSlider
 *   value={[20, 80]}
 *   onValueChange={setRange}
 *   formatValue={(v) => `$${v}`}
 * />
 *
 * // Rating slider
 * <RatingSlider value={4} max={5} onValueChange={setRating} />
 * ```
 */

import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSemanticColor } from '@/hooks/use-theme-color';
import * as Haptics from 'expo-haptics';

// Types
export type SliderColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type SliderSize = 'sm' | 'md' | 'lg';

// Hook to get slider color values
function useSliderColors() {
  const primary = useSemanticColor('primary');
  const secondary = useSemanticColor('secondary');
  const accent = useSemanticColor('accent');
  const success = useSemanticColor('success');
  const warning = useSemanticColor('warning');
  const danger = useSemanticColor('danger');
  const info = useSemanticColor('info');

  return useMemo(
    () => ({
      primary,
      secondary,
      accent,
      success,
      warning,
      danger,
      info,
    }),
    [primary, secondary, accent, success, warning, danger, info]
  );
}

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color?: SliderColor;
  size?: SliderSize;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  showMinMax?: boolean;
  disabled?: boolean;
  hapticFeedback?: boolean;
  marks?: number[] | boolean;
  className?: string;
}

export interface RangeSliderProps {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  color?: SliderColor;
  size?: SliderSize;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  minDistance?: number;
  disabled?: boolean;
  hapticFeedback?: boolean;
  className?: string;
}

// Size configurations
const sizeConfig = {
  sm: { track: 4, thumb: 16, fontSize: 12 },
  md: { track: 6, thumb: 20, fontSize: 14 },
  lg: { track: 8, thumb: 24, fontSize: 16 },
};

// Main Slider Component
export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  color = 'primary',
  size = 'md',
  label,
  showValue = false,
  formatValue = (v) => v.toString(),
  showMinMax = false,
  disabled = false,
  hapticFeedback = true,
  marks = false,
  className = '',
}: SliderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfig[size];
  const sliderColors = useSliderColors();
  const colorValue = sliderColors[color] || sliderColors.primary;

  // Track and marks colors
  const trackBgLight = useSemanticColor('secondary', '200');
  const trackBgDark = useSemanticColor('secondary', '700');
  const markLight = useSemanticColor('secondary', '400');
  const markDark = useSemanticColor('secondary', '500');
  const trackBgColor = isDark ? trackBgDark : trackBgLight;
  const markInactiveColor = isDark ? markDark : markLight;

  const [trackWidth, setTrackWidth] = useState(0);
  const lastHapticValue = useRef(value);
  const thumbPosition = useRef(new Animated.Value(0)).current;

  // Calculate position from value
  const getPositionFromValue = (val: number) => {
    const percentage = (val - min) / (max - min);
    return percentage * trackWidth;
  };

  // Calculate value from position
  const getValueFromPosition = (position: number) => {
    const percentage = Math.max(0, Math.min(1, position / trackWidth));
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  };

  // Update thumb position when value changes externally
  React.useEffect(() => {
    if (trackWidth > 0) {
      thumbPosition.setValue(getPositionFromValue(value));
    }
  }, [value, trackWidth]);

  // Handle layout
  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width - config.thumb;
    setTrackWidth(width);
    thumbPosition.setValue(getPositionFromValue(value));
  };

  // Trigger haptic feedback on step change
  const triggerHaptic = (newValue: number) => {
    if (hapticFeedback && newValue !== lastHapticValue.current) {
      lastHapticValue.current = newValue;
      Haptics.selectionAsync();
    }
  };

  // Pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (_, gestureState) => {
        // Stop any animation
        thumbPosition.stopAnimation();
      },
      onPanResponderMove: (
        event: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const locationX = event.nativeEvent.locationX - config.thumb / 2;
        const newValue = getValueFromPosition(locationX + gestureState.dx);
        thumbPosition.setValue(getPositionFromValue(newValue));
        triggerHaptic(newValue);
        onValueChange(newValue);
      },
      onPanResponderRelease: () => {
        // Snap to final position
        thumbPosition.setValue(getPositionFromValue(value));
      },
    })
  ).current;

  // Handle track press
  const handleTrackPress = (event: GestureResponderEvent) => {
    if (disabled) return;
    const locationX = event.nativeEvent.locationX - config.thumb / 2;
    const newValue = getValueFromPosition(locationX);
    Animated.spring(thumbPosition, {
      toValue: getPositionFromValue(newValue),
      useNativeDriver: false,
      friction: 8,
    }).start();
    triggerHaptic(newValue);
    onValueChange(newValue);
  };

  // Generate marks
  const markValues = Array.isArray(marks)
    ? marks
    : marks
      ? Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step)
      : [];

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View className={`${disabled ? 'opacity-50' : ''} ${className}`}>
      {/* Label and value */}
      {(label || showValue) && (
        <View className="flex-row justify-between mb-2">
          {label && (
            <Text
              className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontSize: config.fontSize }}
            >
              {label}
            </Text>
          )}
          {showValue && (
            <Text
              className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontSize: config.fontSize }}
            >
              {formatValue(value)}
            </Text>
          )}
        </View>
      )}

      {/* Track container */}
      <View
        className="justify-center"
        style={{ paddingHorizontal: config.thumb / 2, height: config.thumb + 8 }}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => true}
        onResponderRelease={handleTrackPress}
        {...panResponder.panHandlers}
      >
        {/* Track background */}
        <View
          className="absolute left-0 right-0 rounded-full"
          style={{
            height: config.track,
            backgroundColor: trackBgColor,
            marginHorizontal: config.thumb / 2,
          }}
        />

        {/* Filled track */}
        <Animated.View
          className="absolute rounded-full"
          style={{
            height: config.track,
            backgroundColor: colorValue,
            left: config.thumb / 2,
            width: thumbPosition,
          }}
        />

        {/* Marks */}
        {markValues.length > 0 && trackWidth > 0 && (
          <View className="absolute left-0 right-0" style={{ marginHorizontal: config.thumb / 2 }}>
            {markValues.map((mark) => {
              const markPosition = getPositionFromValue(mark);
              return (
                <View
                  key={mark}
                  className="absolute rounded-full"
                  style={{
                    width: 4,
                    height: 4,
                    backgroundColor: mark <= value ? '#ffffff' : markInactiveColor,
                    left: markPosition - 2,
                    top: -2,
                  }}
                />
              );
            })}
          </View>
        )}

        {/* Thumb */}
        <Animated.View
          className="absolute rounded-full shadow-md"
          style={{
            width: config.thumb,
            height: config.thumb,
            backgroundColor: '#ffffff',
            borderWidth: 2,
            borderColor: colorValue,
            transform: [{ translateX: thumbPosition }],
          }}
        />
      </View>

      {/* Min/Max labels */}
      {showMinMax && (
        <View
          className="flex-row justify-between mt-1"
          style={{ paddingHorizontal: config.thumb / 2 }}
        >
          <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {formatValue(min)}
          </Text>
          <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {formatValue(max)}
          </Text>
        </View>
      )}
    </View>
  );
}

// Range Slider Component
export function RangeSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  color = 'primary',
  size = 'md',
  label,
  showValue = false,
  formatValue = (v) => v.toString(),
  minDistance = 0,
  disabled = false,
  hapticFeedback = true,
  className = '',
}: RangeSliderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfig[size];
  const sliderColors = useSliderColors();
  const colorValue = sliderColors[color] || sliderColors.primary;

  // Track colors
  const trackBgLight = useSemanticColor('secondary', '200');
  const trackBgDark = useSemanticColor('secondary', '700');
  const trackBgColor = isDark ? trackBgDark : trackBgLight;

  const [trackWidth, setTrackWidth] = useState(0);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
  const lastHapticValues = useRef(value);

  const minThumbPosition = useRef(new Animated.Value(0)).current;
  const maxThumbPosition = useRef(new Animated.Value(0)).current;

  const getPositionFromValue = (val: number) => {
    const percentage = (val - min) / (max - min);
    return percentage * trackWidth;
  };

  const getValueFromPosition = (position: number) => {
    const percentage = Math.max(0, Math.min(1, position / trackWidth));
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  };

  React.useEffect(() => {
    if (trackWidth > 0) {
      minThumbPosition.setValue(getPositionFromValue(value[0]));
      maxThumbPosition.setValue(getPositionFromValue(value[1]));
    }
  }, [value, trackWidth]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width - config.thumb;
    setTrackWidth(width);
    minThumbPosition.setValue(getPositionFromValue(value[0]));
    maxThumbPosition.setValue(getPositionFromValue(value[1]));
  };

  const triggerHaptic = (newMin: number, newMax: number) => {
    if (
      hapticFeedback &&
      (newMin !== lastHapticValues.current[0] || newMax !== lastHapticValues.current[1])
    ) {
      lastHapticValues.current = [newMin, newMax];
      Haptics.selectionAsync();
    }
  };

  const createPanResponder = (thumb: 'min' | 'max') =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        setActiveThumb(thumb);
      },
      onPanResponderMove: (event, gestureState) => {
        const locationX = event.nativeEvent.locationX - config.thumb / 2;
        const newValue = getValueFromPosition(locationX + gestureState.dx);

        let newMin = value[0];
        let newMax = value[1];

        if (thumb === 'min') {
          newMin = Math.min(newValue, value[1] - minDistance);
          minThumbPosition.setValue(getPositionFromValue(newMin));
        } else {
          newMax = Math.max(newValue, value[0] + minDistance);
          maxThumbPosition.setValue(getPositionFromValue(newMax));
        }

        triggerHaptic(newMin, newMax);
        onValueChange([newMin, newMax]);
      },
      onPanResponderRelease: () => {
        setActiveThumb(null);
      },
    });

  const minPanResponder = useRef(createPanResponder('min')).current;
  const maxPanResponder = useRef(createPanResponder('max')).current;

  return (
    <View className={`${disabled ? 'opacity-50' : ''} ${className}`}>
      {/* Label and values */}
      {(label || showValue) && (
        <View className="flex-row justify-between mb-2">
          {label && (
            <Text
              className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontSize: config.fontSize }}
            >
              {label}
            </Text>
          )}
          {showValue && (
            <Text
              className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontSize: config.fontSize }}
            >
              {formatValue(value[0])} - {formatValue(value[1])}
            </Text>
          )}
        </View>
      )}

      {/* Track container */}
      <View
        className="justify-center"
        style={{ paddingHorizontal: config.thumb / 2, height: config.thumb + 8 }}
        onLayout={handleLayout}
      >
        {/* Track background */}
        <View
          className="absolute left-0 right-0 rounded-full"
          style={{
            height: config.track,
            backgroundColor: trackBgColor,
            marginHorizontal: config.thumb / 2,
          }}
        />

        {/* Filled track */}
        <Animated.View
          className="absolute rounded-full"
          style={{
            height: config.track,
            backgroundColor: colorValue,
            left: Animated.add(minThumbPosition, config.thumb / 2),
            width: Animated.subtract(maxThumbPosition, minThumbPosition),
          }}
        />

        {/* Min thumb */}
        <Animated.View
          className={`absolute rounded-full shadow-md ${activeThumb === 'min' ? 'z-10' : ''}`}
          style={{
            width: config.thumb,
            height: config.thumb,
            backgroundColor: '#ffffff',
            borderWidth: 2,
            borderColor: colorValue,
            transform: [{ translateX: minThumbPosition }],
          }}
          {...minPanResponder.panHandlers}
        />

        {/* Max thumb */}
        <Animated.View
          className={`absolute rounded-full shadow-md ${activeThumb === 'max' ? 'z-10' : ''}`}
          style={{
            width: config.thumb,
            height: config.thumb,
            backgroundColor: '#ffffff',
            borderWidth: 2,
            borderColor: colorValue,
            transform: [{ translateX: maxThumbPosition }],
          }}
          {...maxPanResponder.panHandlers}
        />
      </View>
    </View>
  );
}

// Rating Slider
export interface RatingSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  max?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  iconFilled?: keyof typeof Ionicons.glyphMap;
  color?: string;
  size?: number;
  disabled?: boolean;
  hapticFeedback?: boolean;
  className?: string;
}

export function RatingSlider({
  value,
  onValueChange,
  max = 5,
  icon = 'star-outline',
  iconFilled = 'star',
  color,
  size = 32,
  disabled = false,
  hapticFeedback = true,
  className = '',
}: RatingSliderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const warningColor = useSemanticColor('warning');
  const secondaryLight = useSemanticColor('secondary', '200');
  const secondaryDark = useSemanticColor('secondary', '700');
  const activeColor = color ?? warningColor;
  const inactiveColor = isDark ? secondaryDark : secondaryLight;

  const handlePress = (rating: number) => {
    if (disabled) return;
    if (hapticFeedback) {
      Haptics.selectionAsync();
    }
    onValueChange(rating);
  };

  return (
    <View className={`flex-row gap-1 ${disabled ? 'opacity-50' : ''} ${className}`}>
      {Array.from({ length: max }).map((_, index) => {
        const rating = index + 1;
        const isFilled = rating <= value;

        return (
          <View
            key={index}
            onStartShouldSetResponder={() => true}
            onResponderRelease={() => handlePress(rating)}
            style={{ padding: 4 }}
          >
            <Ionicons
              name={isFilled ? iconFilled : icon}
              size={size}
              color={isFilled ? activeColor : inactiveColor}
            />
          </View>
        );
      })}
    </View>
  );
}

// Volume Slider - specialized for audio
export interface VolumeSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  muted?: boolean;
  onMuteToggle?: () => void;
  showIcon?: boolean;
  className?: string;
}

export function VolumeSlider({
  value,
  onValueChange,
  muted = false,
  onMuteToggle,
  showIcon = true,
  className = '',
}: VolumeSliderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const secondaryLight = useSemanticColor('secondary', '500');
  const secondaryDark = useSemanticColor('secondary', '400');
  const iconColor = isDark ? secondaryDark : secondaryLight;

  const getVolumeIcon = (): keyof typeof Ionicons.glyphMap => {
    if (muted || value === 0) return 'volume-mute';
    if (value < 33) return 'volume-low';
    if (value < 66) return 'volume-medium';
    return 'volume-high';
  };

  return (
    <View className={`flex-row items-center gap-3 ${className}`}>
      {showIcon && (
        <View onStartShouldSetResponder={() => true} onResponderRelease={onMuteToggle}>
          <Ionicons name={getVolumeIcon()} size={24} color={iconColor} />
        </View>
      )}
      <View className="flex-1">
        <Slider
          value={muted ? 0 : value}
          onValueChange={onValueChange}
          min={0}
          max={100}
          disabled={muted}
        />
      </View>
    </View>
  );
}

// Temperature Slider - with gradient track
export interface TemperatureSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: '°C' | '°F';
  showValue?: boolean;
  className?: string;
}

export function TemperatureSlider({
  value,
  onValueChange,
  min = 16,
  max = 30,
  unit = '°C',
  showValue = true,
  className = '',
}: TemperatureSliderProps) {
  const formatTemp = (v: number) => `${v}${unit}`;

  return (
    <Slider
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={0.5}
      showValue={showValue}
      formatValue={formatTemp}
      showMinMax
      color={value < (min + max) / 2 ? 'info' : 'danger'}
      className={className}
    />
  );
}
