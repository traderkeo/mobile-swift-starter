/**
 * Radio Component
 *
 * Radio buttons for selecting a single option from a group.
 *
 * @example
 * // Basic radio group
 * <RadioGroup
 *   value={selected}
 *   onValueChange={setSelected}
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' },
 *     { value: 'option3', label: 'Option 3' },
 *   ]}
 * />
 *
 * // With descriptions
 * <RadioGroup
 *   label="Select plan"
 *   value={plan}
 *   onValueChange={setPlan}
 *   options={[
 *     { value: 'free', label: 'Free', description: 'Basic features' },
 *     { value: 'pro', label: 'Pro', description: 'Advanced features' },
 *   ]}
 * />
 *
 * // Horizontal layout
 * <RadioGroup
 *   direction="horizontal"
 *   value={size}
 *   onValueChange={setSize}
 *   options={[
 *     { value: 'sm', label: 'Small' },
 *     { value: 'md', label: 'Medium' },
 *     { value: 'lg', label: 'Large' },
 *   ]}
 * />
 *
 * // Radio cards
 * <RadioCardGroup
 *   value={tier}
 *   onValueChange={setTier}
 *   options={[
 *     { value: 'basic', label: 'Basic', description: '$9/mo' },
 *     { value: 'pro', label: 'Pro', description: '$19/mo' },
 *   ]}
 * />
 */

import React from 'react';
import { View, TouchableOpacity, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Text } from './Text';

// ===========================================
// TYPES
// ===========================================

export type RadioSize = 'sm' | 'md' | 'lg';
export type RadioColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface RadioProps {
  selected: boolean;
  onSelect: () => void;
  label?: string;
  description?: string;
  size?: RadioSize;
  color?: RadioColor;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

interface SizeConfig {
  outer: number;
  inner: number;
}

const sizeConfigs: Record<RadioSize, SizeConfig> = {
  sm: { outer: 16, inner: 8 },
  md: { outer: 20, inner: 10 },
  lg: { outer: 24, inner: 12 },
};

// ===========================================
// COLOR CONFIGURATIONS
// ===========================================

const colorValues: Record<RadioColor, string> = {
  primary: '#0a7ea4',
  secondary: '#6b7280',
  accent: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

// ===========================================
// RADIO COMPONENT
// ===========================================

export function Radio({
  selected,
  onSelect,
  label,
  description,
  size = 'md',
  color = 'primary',
  disabled = false,
  className = '',
  style,
}: RadioProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfigs[size];

  const handlePress = () => {
    if (!disabled) {
      onSelect();
    }
  };

  // Colors
  const activeColor = colorValues[color];
  const borderColor = selected ? activeColor : isDark ? '#4b5563' : '#d1d5db';

  const radioElement = (
    <View
      style={[
        {
          width: config.outer,
          height: config.outer,
          borderRadius: config.outer / 2,
          borderWidth: 2,
          borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {selected && (
        <View
          style={{
            width: config.inner,
            height: config.inner,
            borderRadius: config.inner / 2,
            backgroundColor: activeColor,
          }}
        />
      )}
    </View>
  );

  const hasLabel = label || description;

  // If no label, just return the radio
  if (!hasLabel) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        className={className}
        style={style}
      >
        {radioElement}
      </TouchableOpacity>
    );
  }

  // With label/description
  return (
    <TouchableOpacity
      className={`flex-row items-start ${className}`}
      style={style}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View className="mt-0.5">{radioElement}</View>
      <View className="flex-1 ml-3">
        {label && (
          <Text weight="medium" color={disabled ? 'muted' : 'default'}>
            {label}
          </Text>
        )}
        {description && (
          <Text size="sm" color="muted" className="mt-0.5">
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ===========================================
// RADIO GROUP COMPONENT
// ===========================================

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
  size?: RadioSize;
  color?: RadioColor;
  disabled?: boolean;
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export function RadioGroup({
  value,
  onValueChange,
  options,
  label,
  size = 'md',
  color = 'primary',
  disabled = false,
  direction = 'vertical',
  className = '',
}: RadioGroupProps) {
  return (
    <View className={className}>
      {label && (
        <Text weight="medium" className="mb-3">
          {label}
        </Text>
      )}
      <View className={direction === 'horizontal' ? 'flex-row flex-wrap gap-4' : 'gap-3'}>
        {options.map((option) => (
          <Radio
            key={option.value}
            selected={value === option.value}
            onSelect={() => onValueChange(option.value)}
            label={option.label}
            description={option.description}
            size={size}
            color={color}
            disabled={disabled || option.disabled}
          />
        ))}
      </View>
    </View>
  );
}

// ===========================================
// RADIO CARD COMPONENT
// ===========================================

export interface RadioCardProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
  children?: React.ReactNode;
  color?: RadioColor;
  disabled?: boolean;
  className?: string;
}

export function RadioCard({
  selected,
  onSelect,
  label,
  description,
  children,
  color = 'primary',
  disabled = false,
  className = '',
}: RadioCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const activeColor = colorValues[color];

  return (
    <TouchableOpacity
      onPress={() => !disabled && onSelect()}
      disabled={disabled}
      activeOpacity={0.7}
      className={`p-4 rounded-xl ${disabled ? 'opacity-50' : ''} ${className}`}
      style={{
        borderColor: selected ? activeColor : isDark ? '#374151' : '#e5e7eb',
        borderWidth: selected ? 2 : 1,
        backgroundColor: selected
          ? isDark
            ? `${activeColor}15`
            : `${activeColor}08`
          : 'transparent',
      }}
    >
      <View className="flex-row items-start">
        <Radio selected={selected} onSelect={onSelect} color={color} disabled={disabled} />
        <View className="flex-1 ml-3">
          <Text weight="semibold" color={disabled ? 'muted' : 'default'}>
            {label}
          </Text>
          {description && (
            <Text size="sm" color="muted" className="mt-1">
              {description}
            </Text>
          )}
          {children}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ===========================================
// RADIO CARD GROUP COMPONENT
// ===========================================

export interface RadioCardGroupProps extends Omit<RadioGroupProps, 'direction'> {
  /** Number of columns (1 = stacked, 2+ = grid) */
  columns?: number;
}

export function RadioCardGroup({
  value,
  onValueChange,
  options,
  label,
  color = 'primary',
  disabled = false,
  columns = 1,
  className = '',
}: RadioCardGroupProps) {
  return (
    <View className={className}>
      {label && (
        <Text weight="medium" className="mb-3">
          {label}
        </Text>
      )}
      <View
        className="gap-3"
        style={columns > 1 ? { flexDirection: 'row', flexWrap: 'wrap' } : undefined}
      >
        {options.map((option) => (
          <View
            key={option.value}
            style={columns > 1 ? { width: `${100 / columns - 2}%` } : undefined}
          >
            <RadioCard
              selected={value === option.value}
              onSelect={() => onValueChange(option.value)}
              label={option.label}
              description={option.description}
              color={color}
              disabled={disabled || option.disabled}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
