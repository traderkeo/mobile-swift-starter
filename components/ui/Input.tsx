/**
 * Input Component
 *
 * A versatile text input component with variants, sizes, and states.
 *
 * @example
 * // Basic usage
 * <Input placeholder="Enter your name" value={name} onChangeText={setName} />
 *
 * // With label
 * <Input label="Email" placeholder="email@example.com" />
 *
 * // Variants
 * <Input variant="outlined" label="Outlined" />
 * <Input variant="filled" label="Filled" />
 * <Input variant="underlined" label="Underlined" />
 *
 * // Sizes
 * <Input size="sm" placeholder="Small input" />
 * <Input size="md" placeholder="Medium input" />
 * <Input size="lg" placeholder="Large input" />
 *
 * // With icons
 * <Input leftIcon="search" placeholder="Search..." />
 * <Input rightIcon="close-circle" onRightIconPress={clearInput} />
 *
 * // Password input
 * <Input type="password" label="Password" />
 *
 * // With error
 * <Input label="Email" error="Invalid email address" />
 *
 * // With helper text
 * <Input label="Username" helperText="Must be at least 3 characters" />
 *
 * // Disabled state
 * <Input label="Disabled" disabled value="Cannot edit" />
 *
 * // Multiline (textarea)
 * <Input multiline numberOfLines={4} placeholder="Enter description..." />
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsDark } from '@/hooks/use-theme-color';

// ===========================================
// TYPES
// ===========================================

export type InputVariant = 'outlined' | 'filled' | 'underlined';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  variant?: InputVariant;
  size?: InputSize;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  type?: 'text' | 'password' | 'email' | 'phone' | 'number';
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
  className?: string;
  containerClassName?: string;
  inputClassName?: string;
  style?: ViewStyle;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

interface SizeConfig {
  height: string;
  padding: string;
  fontSize: string;
  labelSize: string;
  iconSize: number;
  iconPadding: number;
}

const sizeConfigs: Record<InputSize, SizeConfig> = {
  sm: {
    height: 'h-9',
    padding: 'px-3',
    fontSize: 'text-sm',
    labelSize: 'text-xs',
    iconSize: 16,
    iconPadding: 36,
  },
  md: {
    height: 'h-11',
    padding: 'px-4',
    fontSize: 'text-base',
    labelSize: 'text-sm',
    iconSize: 18,
    iconPadding: 44,
  },
  lg: {
    height: 'h-14',
    padding: 'px-4',
    fontSize: 'text-lg',
    labelSize: 'text-sm',
    iconSize: 20,
    iconPadding: 48,
  },
};

// ===========================================
// VARIANT CONFIGURATIONS
// ===========================================

interface VariantConfig {
  container: { light: string; dark: string };
  focused: { light: string; dark: string };
  error: string;
}

const variantConfigs: Record<InputVariant, VariantConfig> = {
  outlined: {
    container: {
      light: 'border border-border bg-transparent rounded-lg',
      dark: 'border border-border-dark bg-transparent rounded-lg',
    },
    focused: {
      light: 'border-primary',
      dark: 'border-primary',
    },
    error: 'border-danger',
  },
  filled: {
    container: {
      light: 'bg-background-secondary border-0 rounded-lg',
      dark: 'bg-background-dark-tertiary border-0 rounded-lg',
    },
    focused: {
      light: 'bg-background-tertiary',
      dark: 'bg-background-dark-secondary',
    },
    error: 'bg-danger/10',
  },
  underlined: {
    container: {
      light: 'border-b border-border bg-transparent rounded-none',
      dark: 'border-b border-border-dark bg-transparent rounded-none',
    },
    focused: {
      light: 'border-b-2 border-primary',
      dark: 'border-b-2 border-primary',
    },
    error: 'border-danger',
  },
};

// ===========================================
// COMPONENT
// ===========================================

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      variant = 'outlined',
      size = 'md',
      error,
      helperText,
      disabled = false,
      type = 'text',
      leftIcon,
      rightIcon,
      onLeftIconPress,
      onRightIconPress,
      className = '',
      containerClassName = '',
      inputClassName = '',
      style,
      multiline,
      numberOfLines,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isDark = useIsDark();

    const sizeConfig = sizeConfigs[size];
    const variantConfig = variantConfigs[variant];

    // Determine if this is a password field
    const isPassword = type === 'password';
    const hasRightIcon = rightIcon || isPassword;

    // Get keyboard type based on input type
    const getKeyboardType = (): TextInputProps['keyboardType'] => {
      switch (type) {
        case 'email':
          return 'email-address';
        case 'phone':
          return 'phone-pad';
        case 'number':
          return 'numeric';
        default:
          return 'default';
      }
    };

    // Build container classes
    const containerClasses = [
      'flex-row items-center',
      sizeConfig.height,
      isDark ? variantConfig.container.dark : variantConfig.container.light,
      isFocused && !error
        ? isDark
          ? variantConfig.focused.dark
          : variantConfig.focused.light
        : '',
      error ? variantConfig.error : '',
      disabled ? 'opacity-50' : '',
    ]
      .filter(Boolean)
      .join(' ');

    // Text colors
    const textColor = isDark ? '#ECEDEE' : '#11181C';
    const placeholderColor = isDark ? '#687076' : '#9BA1A6';
    const iconColor = error ? '#ef4444' : isFocused ? '#0a7ea4' : isDark ? '#9BA1A6' : '#687076';

    // Calculate padding based on icons
    const paddingLeft = leftIcon ? sizeConfig.iconPadding : undefined;
    const paddingRight = hasRightIcon ? sizeConfig.iconPadding : undefined;

    return (
      <View className={`${className}`} style={style}>
        {/* Label */}
        {label && (
          <Text
            className={`${sizeConfig.labelSize} font-medium mb-1.5 ${
              error ? 'text-danger' : 'text-foreground dark:text-foreground-dark'
            }`}
          >
            {label}
          </Text>
        )}

        {/* Input Container */}
        <View className={`${containerClasses} ${containerClassName}`}>
          {/* Left Icon */}
          {leftIcon && (
            <TouchableOpacity
              className="absolute left-3 z-10"
              onPress={onLeftIconPress}
              disabled={!onLeftIconPress || disabled}
              activeOpacity={onLeftIconPress ? 0.7 : 1}
            >
              <Ionicons name={leftIcon} size={sizeConfig.iconSize} color={iconColor} />
            </TouchableOpacity>
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            className={`flex-1 ${sizeConfig.fontSize} ${sizeConfig.padding} text-foreground dark:text-foreground-dark ${inputClassName}`}
            style={{
              paddingLeft,
              paddingRight,
              color: textColor,
              height: multiline ? undefined : '100%',
              textAlignVertical: multiline ? 'top' : 'center',
            }}
            placeholderTextColor={placeholderColor}
            editable={!disabled}
            secureTextEntry={isPassword && !showPassword}
            keyboardType={getKeyboardType()}
            autoCapitalize={type === 'email' ? 'none' : props.autoCapitalize}
            multiline={multiline}
            numberOfLines={numberOfLines}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          {hasRightIcon && (
            <TouchableOpacity
              className="absolute right-3 z-10"
              onPress={isPassword ? () => setShowPassword(!showPassword) : onRightIconPress}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isPassword ? (showPassword ? 'eye-off-outline' : 'eye-outline') : rightIcon!}
                size={sizeConfig.iconSize}
                color={iconColor}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Error or Helper Text */}
        {(error || helperText) && (
          <Text
            className={`text-xs mt-1.5 ml-1 ${
              error ? 'text-danger' : 'text-foreground-muted dark:text-foreground-dark-muted'
            }`}
          >
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * Search Input - An input styled for search
 */
export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onClear?: () => void;
}

export function SearchInput({ value, onClear, ...props }: SearchInputProps) {
  return (
    <Input
      leftIcon="search"
      rightIcon={value ? 'close-circle' : undefined}
      onRightIconPress={onClear}
      variant="filled"
      placeholder="Search..."
      value={value}
      {...props}
    />
  );
}

/**
 * Password Input - An input for passwords with visibility toggle
 */
export function PasswordInput(props: Omit<InputProps, 'type'>) {
  return <Input type="password" {...props} />;
}

/**
 * Email Input - An input for email addresses
 */
export function EmailInput(props: Omit<InputProps, 'type' | 'leftIcon'>) {
  return <Input type="email" leftIcon="mail-outline" {...props} />;
}

/**
 * Textarea - A multiline text input
 */
export interface TextareaProps extends Omit<InputProps, 'multiline' | 'numberOfLines'> {
  rows?: number;
}

export function Textarea({ rows = 4, ...props }: TextareaProps) {
  return <Input multiline numberOfLines={rows} {...props} className={`${props.className ?? ''}`} />;
}
