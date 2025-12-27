/**
 * Checkbox Component
 *
 * A checkbox for selecting one or multiple options.
 *
 * @example
 * // Basic usage
 * <Checkbox checked={isChecked} onCheckedChange={setIsChecked} />
 *
 * // With label
 * <Checkbox
 *   label="I agree to the terms"
 *   checked={agreed}
 *   onCheckedChange={setAgreed}
 * />
 *
 * // With description
 * <Checkbox
 *   label="Marketing emails"
 *   description="Receive promotional content and updates"
 *   checked={marketing}
 *   onCheckedChange={setMarketing}
 * />
 *
 * // Sizes
 * <Checkbox size="sm" checked={value} onCheckedChange={setValue} />
 * <Checkbox size="md" checked={value} onCheckedChange={setValue} />
 * <Checkbox size="lg" checked={value} onCheckedChange={setValue} />
 *
 * // Colors
 * <Checkbox color="primary" checked={value} onCheckedChange={setValue} />
 * <Checkbox color="success" checked={value} onCheckedChange={setValue} />
 *
 * // Indeterminate state (for "select all" scenarios)
 * <Checkbox indeterminate checked={false} onCheckedChange={handleSelectAll} />
 *
 * // Checkbox group
 * <CheckboxGroup
 *   label="Select interests"
 *   value={selectedInterests}
 *   onValueChange={setSelectedInterests}
 *   options={[
 *     { value: 'tech', label: 'Technology' },
 *     { value: 'sports', label: 'Sports' },
 *     { value: 'music', label: 'Music' },
 *   ]}
 * />
 */

import React, { useMemo } from 'react';
import { View, TouchableOpacity, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSemanticColor } from '@/hooks/use-theme-color';
import { Text } from './Text';

// ===========================================
// TYPES
// ===========================================

export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: CheckboxSize;
  color?: CheckboxColor;
  disabled?: boolean;
  indeterminate?: boolean;
  className?: string;
  style?: ViewStyle;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

interface SizeConfig {
  box: number;
  iconSize: number;
  borderRadius: number;
}

const sizeConfigs: Record<CheckboxSize, SizeConfig> = {
  sm: { box: 16, iconSize: 12, borderRadius: 4 },
  md: { box: 20, iconSize: 14, borderRadius: 5 },
  lg: { box: 24, iconSize: 18, borderRadius: 6 },
};

// ===========================================
// HOOK FOR CHECKBOX COLORS
// ===========================================

function useCheckboxColors() {
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

// ===========================================
// COMPONENT
// ===========================================

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  size = 'md',
  color = 'primary',
  disabled = false,
  indeterminate = false,
  className = '',
  style,
}: CheckboxProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfigs[size];
  const checkboxColors = useCheckboxColors();
  const colorValue = checkboxColors[color] || checkboxColors.primary;

  // Border colors for inactive state
  const borderLight = useSemanticColor('secondary', '300');
  const borderDark = useSemanticColor('secondary', '600');

  const handlePress = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  // Determine visual state
  const isActive = checked || indeterminate;

  // Colors
  const backgroundColor = isActive ? colorValue : 'transparent';
  const borderColor = isActive ? colorValue : isDark ? borderDark : borderLight;

  const checkboxElement = (
    <View
      style={[
        {
          width: config.box,
          height: config.box,
          borderRadius: config.borderRadius,
          borderWidth: 2,
          borderColor,
          backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {isActive && (
        <Ionicons
          name={indeterminate ? 'remove' : 'checkmark'}
          size={config.iconSize}
          color="#ffffff"
        />
      )}
    </View>
  );

  const hasLabel = label || description;

  // If no label, just return the checkbox
  if (!hasLabel) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        className={className}
        style={style}
      >
        {checkboxElement}
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
      <View className="mt-0.5">{checkboxElement}</View>
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
// CHECKBOX GROUP COMPONENT
// ===========================================

export interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: CheckboxOption[];
  label?: string;
  size?: CheckboxSize;
  color?: CheckboxColor;
  disabled?: boolean;
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export function CheckboxGroup({
  value,
  onValueChange,
  options,
  label,
  size = 'md',
  color = 'primary',
  disabled = false,
  direction = 'vertical',
  className = '',
}: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onValueChange([...value, optionValue]);
    } else {
      onValueChange(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <View className={className}>
      {label && (
        <Text weight="medium" className="mb-3">
          {label}
        </Text>
      )}
      <View className={direction === 'horizontal' ? 'flex-row flex-wrap gap-4' : 'gap-3'}>
        {options.map((option) => (
          <Checkbox
            key={option.value}
            checked={value.includes(option.value)}
            onCheckedChange={(checked) => handleChange(option.value, checked)}
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
// CHECKBOX CARD COMPONENT
// ===========================================

export interface CheckboxCardProps extends Omit<CheckboxProps, 'className'> {
  /** Content to render inside the card */
  children?: React.ReactNode;
  className?: string;
}

export function CheckboxCard({
  checked,
  onCheckedChange,
  label,
  description,
  children,
  color = 'primary',
  disabled = false,
  className = '',
  ...props
}: CheckboxCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const checkboxColors = useCheckboxColors();
  const colorValue = checkboxColors[color] || checkboxColors.primary;

  // Border colors for inactive state
  const borderLight = useSemanticColor('secondary', '200');
  const borderDark = useSemanticColor('secondary', '700');

  const handlePress = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  const borderColorClass = checked
    ? `border-2 border-${color}`
    : 'border border-border dark:border-border-dark';

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      className={`p-4 rounded-xl ${borderColorClass} ${disabled ? 'opacity-50' : ''} ${className}`}
      style={{
        borderColor: checked ? colorValue : isDark ? borderDark : borderLight,
        borderWidth: checked ? 2 : 1,
      }}
    >
      <View className="flex-row items-start">
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          color={color}
          disabled={disabled}
          {...props}
        />
        <View className="flex-1 ml-3">
          {label && (
            <Text weight="semibold" color={disabled ? 'muted' : 'default'}>
              {label}
            </Text>
          )}
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
