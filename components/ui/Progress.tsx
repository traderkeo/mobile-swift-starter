/**
 * Progress components for loading states, file uploads, and completion tracking
 *
 * Usage:
 * ```tsx
 * // Linear progress bar
 * <ProgressBar value={75} />
 * <ProgressBar value={50} color="success" showLabel />
 *
 * // Circular progress
 * <CircularProgress value={60} size={80} />
 * <CircularProgress value={100} color="success" showLabel />
 *
 * // Indeterminate loading
 * <ProgressBar indeterminate />
 * <CircularProgress indeterminate />
 *
 * // Upload progress
 * <UploadProgress
 *   fileName="document.pdf"
 *   progress={45}
 *   status="uploading"
 * />
 * ```
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Lazy load react-native-svg (optional dependency)
let Svg: React.ComponentType<{
  width?: number;
  height?: number;
  children?: React.ReactNode;
}> | null = null;
let Circle: React.ComponentType<{
  cx?: number;
  cy?: number;
  r?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  strokeDasharray?: string;
  strokeDashoffset?: number;
  strokeLinecap?: string;
}> | null = null;
let G: React.ComponentType<{
  rotation?: number;
  origin?: string;
  children?: React.ReactNode;
}> | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const svg = require('react-native-svg');
  Svg = svg.default || svg.Svg;
  Circle = svg.Circle;
  G = svg.G;
} catch {
  // react-native-svg not installed
}

// Local color constants for progress variants (match tailwind.config.js)
const PROGRESS_COLORS: Record<string, string> = {
  primary: '#0a7ea4',
  secondary: '#6b7280',
  accent: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

// Types
export type ProgressColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ProgressBarProps {
  value?: number;
  max?: number;
  color?: ProgressColor;
  size?: ProgressSize;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside' | 'top';
  indeterminate?: boolean;
  animated?: boolean;
  rounded?: boolean;
  striped?: boolean;
  className?: string;
}

export interface CircularProgressProps {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: ProgressColor;
  trackColor?: string;
  showLabel?: boolean;
  labelSize?: number;
  indeterminate?: boolean;
  className?: string;
}

export interface UploadProgressProps {
  fileName: string;
  fileSize?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
  onCancel?: () => void;
  onRetry?: () => void;
  className?: string;
}

// Size configurations
const sizeConfig: Record<ProgressSize, { height: number; fontSize: number; radius: number }> = {
  xs: { height: 4, fontSize: 10, radius: 2 },
  sm: { height: 6, fontSize: 11, radius: 3 },
  md: { height: 8, fontSize: 12, radius: 4 },
  lg: { height: 12, fontSize: 13, radius: 6 },
  xl: { height: 16, fontSize: 14, radius: 8 },
};

// Get color value
const getColorValue = (color: ProgressColor) => {
  return PROGRESS_COLORS[color] || PROGRESS_COLORS.primary;
};

// Linear Progress Bar
export function ProgressBar({
  value = 0,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel = false,
  labelPosition = 'outside',
  indeterminate = false,
  animated = true,
  rounded = true,
  striped = false,
  className = '',
}: ProgressBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfig[size];
  const colorValue = getColorValue(color);

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const indeterminateAnim = useRef(new Animated.Value(0)).current;

  // Animate value changes
  useEffect(() => {
    if (!indeterminate && animated) {
      Animated.timing(animatedWidth, {
        toValue: percentage,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else if (!indeterminate) {
      animatedWidth.setValue(percentage);
    }
  }, [percentage, indeterminate, animated, animatedWidth]);

  // Indeterminate animation
  useEffect(() => {
    if (indeterminate) {
      const animation = Animated.loop(
        Animated.timing(indeterminateAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      );
      animation.start();
      return () => animation.stop();
    }
  }, [indeterminate, indeterminateAnim]);

  const trackStyle = {
    height: config.height,
    backgroundColor: isDark ? '#374151' : '#E5E7EB',
    borderRadius: rounded ? config.radius : 0,
    overflow: 'hidden' as const,
  };

  const fillStyle: { height: `${number}%`; backgroundColor: string; borderRadius: number } = {
    height: '100%',
    backgroundColor: colorValue,
    borderRadius: rounded ? config.radius : 0,
  };

  const renderLabel = () => {
    if (!showLabel || indeterminate) return null;

    const labelText = `${Math.round(percentage)}%`;

    if (labelPosition === 'inside' && config.height >= 12) {
      return null; // Handled in fill
    }

    if (labelPosition === 'top') {
      return (
        <View className="flex-row justify-between mb-1">
          <Text
            className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
            style={{ fontSize: config.fontSize }}
          >
            Progress
          </Text>
          <Text
            className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
            style={{ fontSize: config.fontSize }}
          >
            {labelText}
          </Text>
        </View>
      );
    }

    return (
      <Text
        className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
        style={{ fontSize: config.fontSize }}
      >
        {labelText}
      </Text>
    );
  };

  if (indeterminate) {
    const translateX = indeterminateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['-30%', '130%'],
    });

    return (
      <View className={className}>
        {labelPosition === 'top' && renderLabel()}
        <View className="flex-row items-center">
          <View style={trackStyle} className="flex-1">
            <Animated.View
              style={[
                fillStyle,
                {
                  width: '30%',
                  transform: [{ translateX }],
                },
              ]}
            />
          </View>
          {labelPosition === 'outside' && renderLabel()}
        </View>
      </View>
    );
  }

  return (
    <View className={className}>
      {labelPosition === 'top' && renderLabel()}
      <View className="flex-row items-center">
        <View style={trackStyle} className="flex-1">
          <Animated.View
            style={[
              fillStyle,
              {
                width: animatedWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            {showLabel && labelPosition === 'inside' && config.height >= 12 && (
              <Text
                className="text-white text-center font-medium"
                style={{ fontSize: config.fontSize - 2, lineHeight: config.height }}
              >
                {Math.round(percentage)}%
              </Text>
            )}
          </Animated.View>
        </View>
        {labelPosition === 'outside' && renderLabel()}
      </View>
    </View>
  );
}

// Circular Progress
// AnimatedCircle is created dynamically since Circle may be null
// Type for animated circle props
interface AnimatedCircleProps {
  cx?: number;
  cy?: number;
  r?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  strokeLinecap?: string;
  strokeDasharray?: string;
  strokeDashoffset?: number | Animated.AnimatedInterpolation<string | number>;
}

const createAnimatedCircle = () => {
  if (Circle) {
    return Animated.createAnimatedComponent(
      Circle as React.ComponentType<AnimatedCircleProps>
    ) as React.ComponentType<AnimatedCircleProps>;
  }
  return null;
};
const AnimatedCircle = Circle ? createAnimatedCircle() : null;

export function CircularProgress({
  value = 0,
  max = 100,
  size = 48,
  strokeWidth = 4,
  color = 'primary',
  trackColor,
  showLabel = false,
  labelSize,
  indeterminate = false,
  className = '',
}: CircularProgressProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colorValue = getColorValue(color);

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // All hooks must be called before any conditional returns
  const animatedValue = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Animate value changes
  useEffect(() => {
    if (!indeterminate && Svg && Circle && G) {
      Animated.timing(animatedValue, {
        toValue: percentage,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [percentage, indeterminate, animatedValue]);

  // Indeterminate rotation
  useEffect(() => {
    if (indeterminate && Svg && Circle && G) {
      const animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    }
  }, [indeterminate, rotateAnim]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const defaultTrackColor = trackColor || (isDark ? '#374151' : '#E5E7EB');
  const effectiveLabelSize = labelSize || size * 0.3;

  // Fallback if react-native-svg is not installed
  if (!Svg || !Circle || !G) {
    return (
      <View
        className={`items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <View
          className="rounded-full border-4"
          style={{
            width: size - 8,
            height: size - 8,
            borderColor: colorValue,
          }}
        />
        {showLabel && (
          <Text
            className="absolute font-bold"
            style={{ fontSize: effectiveLabelSize, color: isDark ? '#ECEDEE' : '#11181C' }}
          >
            {indeterminate ? '' : `${Math.round(percentage)}%`}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View
      className={`items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Animated.View style={indeterminate ? { transform: [{ rotate: rotation }] } : undefined}>
        <Svg width={size} height={size}>
          <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
            {/* Track */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={defaultTrackColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress */}
            {AnimatedCircle && (
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={colorValue}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={indeterminate ? circumference * 0.75 : strokeDashoffset}
              />
            )}
          </G>
        </Svg>
      </Animated.View>

      {/* Label */}
      {showLabel && !indeterminate && (
        <View className="absolute">
          <Text
            className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
            style={{ fontSize: effectiveLabelSize }}
          >
            {Math.round(percentage)}%
          </Text>
        </View>
      )}
    </View>
  );
}

// Upload Progress Component
export function UploadProgress({
  fileName,
  fileSize,
  progress,
  status,
  error,
  onCancel,
  onRetry,
  className = '',
}: UploadProgressProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'complete':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      default:
        return 'document-outline';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'complete':
        return PROGRESS_COLORS.success;
      case 'error':
        return PROGRESS_COLORS.danger;
      default:
        return PROGRESS_COLORS.primary;
    }
  };

  return (
    <View className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} ${className}`}>
      <View className="flex-row items-center">
        {/* Icon */}
        <View
          className="w-10 h-10 rounded-lg items-center justify-center mr-3"
          style={{ backgroundColor: getStatusColor() + '20' }}
        >
          <Ionicons name={getStatusIcon()} size={20} color={getStatusColor()} />
        </View>

        {/* File info */}
        <View className="flex-1">
          <Text
            className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
            numberOfLines={1}
          >
            {fileName}
          </Text>
          <View className="flex-row items-center mt-0.5">
            {status === 'uploading' && (
              <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {Math.round(progress)}% • Uploading...
              </Text>
            )}
            {status === 'pending' && (
              <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Waiting...
              </Text>
            )}
            {status === 'complete' && <Text className="text-xs text-success">Upload complete</Text>}
            {status === 'error' && (
              <Text className="text-xs text-danger">{error || 'Upload failed'}</Text>
            )}
            {fileSize && status !== 'error' && (
              <Text className={`text-xs ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                • {fileSize}
              </Text>
            )}
          </View>
        </View>

        {/* Actions */}
        {status === 'uploading' && onCancel && (
          <TouchableOpacity onPress={onCancel} className="p-2">
            <Ionicons name="close" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        )}
        {status === 'error' && onRetry && (
          <TouchableOpacity onPress={onRetry} className="p-2">
            <Ionicons name="refresh" size={20} color={PROGRESS_COLORS.primary} />
          </TouchableOpacity>
        )}
        {status === 'complete' && (
          <Ionicons name="checkmark" size={20} color={PROGRESS_COLORS.success} />
        )}
      </View>

      {/* Progress bar */}
      {(status === 'uploading' || status === 'pending') && (
        <View className="mt-3">
          <ProgressBar
            value={progress}
            size="sm"
            color={status === 'pending' ? 'secondary' : 'primary'}
            indeterminate={status === 'pending'}
          />
        </View>
      )}
    </View>
  );
}

// Multi-step Progress
export interface MultiProgressProps {
  steps: {
    label: string;
    value: number;
    color?: ProgressColor;
  }[];
  size?: ProgressSize;
  showLabels?: boolean;
  className?: string;
}

export function MultiProgress({
  steps,
  size = 'md',
  showLabels = true,
  className = '',
}: MultiProgressProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfig[size];

  const total = steps.reduce((sum, step) => sum + step.value, 0);

  return (
    <View className={className}>
      {/* Progress bar */}
      <View
        className="flex-row overflow-hidden"
        style={{
          height: config.height,
          borderRadius: config.radius,
          backgroundColor: isDark ? '#374151' : '#E5E7EB',
        }}
      >
        {steps.map((step, index) => {
          const width = (step.value / total) * 100;
          return (
            <View
              key={index}
              style={{
                width: `${width}%`,
                height: '100%',
                backgroundColor: getColorValue(step.color || 'primary'),
              }}
            />
          );
        })}
      </View>

      {/* Labels */}
      {showLabels && (
        <View className="flex-row flex-wrap mt-2 gap-4">
          {steps.map((step, index) => (
            <View key={index} className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getColorValue(step.color || 'primary') }}
              />
              <Text className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {step.label}: {step.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// Goal Progress - shows progress toward a goal with milestone markers
export interface GoalProgressProps {
  current: number;
  goal: number;
  unit?: string;
  color?: ProgressColor;
  milestones?: number[];
  showMilestones?: boolean;
  className?: string;
}

export function GoalProgress({
  current,
  goal,
  unit = '',
  color = 'primary',
  milestones = [],
  showMilestones = true,
  className = '',
}: GoalProgressProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colorValue = getColorValue(color);
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <View className={className}>
      {/* Header */}
      <View className="flex-row justify-between mb-2">
        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {current.toLocaleString()}
          {unit}
        </Text>
        <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          / {goal.toLocaleString()}
          {unit}
        </Text>
      </View>

      {/* Progress bar with milestones */}
      <View className="relative">
        <ProgressBar value={current} max={goal} color={color} size="lg" rounded />

        {/* Milestone markers */}
        {showMilestones &&
          milestones.map((milestone, index) => {
            const position = (milestone / goal) * 100;
            const isReached = current >= milestone;
            return (
              <View
                key={index}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${position}%`, marginLeft: -6 }}
              >
                <View
                  className={`w-3 h-3 rounded-full border-2 ${
                    isReached ? 'border-white' : isDark ? 'border-gray-600' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundColor: isReached ? colorValue : isDark ? '#1F2937' : '#F3F4F6',
                  }}
                />
              </View>
            );
          })}
      </View>

      {/* Percentage */}
      <Text className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {Math.round(percentage)}% complete
      </Text>
    </View>
  );
}
