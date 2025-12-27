/**
 * FormField Component
 *
 * Combined label + input + error wrapper for consistent form layouts.
 *
 * @example
 * // Basic form field
 * <FormField
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   placeholder="Enter your email"
 * />
 *
 * // With validation
 * <FormField
 *   label="Password"
 *   value={password}
 *   onChangeText={setPassword}
 *   type="password"
 *   error={errors.password}
 *   helperText="Must be at least 8 characters"
 * />
 *
 * // Required field with icon
 * <FormField
 *   label="Username"
 *   value={username}
 *   onChangeText={setUsername}
 *   required
 *   leftIcon="person"
 * />
 */

import React, { forwardRef, useId } from 'react';
import { View, Text, TextInput, type TextInputProps, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ===========================================
// TYPES
// ===========================================

export type FormFieldVariant = 'outlined' | 'filled' | 'underlined';
export type FormFieldSize = 'sm' | 'md' | 'lg';

export interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  optional?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: FormFieldVariant;
  size?: FormFieldSize;
  type?: 'text' | 'email' | 'password' | 'phone' | 'number';
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  style?: ViewStyle;
  testID?: string;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

const sizeClasses: Record<
  FormFieldSize,
  { input: string; label: string; icon: number; helper: string }
> = {
  sm: { input: 'py-2 px-3 text-sm', label: 'text-xs', icon: 16, helper: 'text-xs' },
  md: { input: 'py-3 px-4 text-base', label: 'text-sm', icon: 20, helper: 'text-sm' },
  lg: { input: 'py-4 px-5 text-lg', label: 'text-base', icon: 24, helper: 'text-base' },
};

// ===========================================
// VARIANT CONFIGURATIONS
// ===========================================

const getVariantClasses = (
  variant: FormFieldVariant,
  isDark: boolean,
  hasError: boolean,
  isFocused: boolean
): string => {
  const errorBorder = 'border-danger';
  const focusBorder = isDark ? 'border-primary-400' : 'border-primary';
  const defaultBorder = isDark ? 'border-border-dark' : 'border-border';

  const borderColor = hasError ? errorBorder : isFocused ? focusBorder : defaultBorder;

  switch (variant) {
    case 'outlined':
      return `border rounded-xl ${borderColor} ${isDark ? 'bg-transparent' : 'bg-transparent'}`;
    case 'filled':
      return `border rounded-xl ${borderColor} ${isDark ? 'bg-background-dark-tertiary' : 'bg-background-secondary'}`;
    case 'underlined':
      return `border-b-2 ${borderColor} ${isDark ? 'bg-transparent' : 'bg-transparent'} rounded-none`;
    default:
      return '';
  }
};

// ===========================================
// MAIN FORMFIELD COMPONENT
// ===========================================

export const FormField = forwardRef<TextInput, FormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      optional = false,
      leftIcon,
      rightIcon,
      onRightIconPress,
      variant = 'outlined',
      size = 'md',
      type = 'text',
      disabled = false,
      className = '',
      inputClassName = '',
      labelClassName = '',
      style,
      testID,
      onFocus,
      onBlur,
      ...inputProps
    },
    ref
  ) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const sizeConfig = sizeClasses[size];
    const uniqueId = useId();

    const [isFocused, setIsFocused] = React.useState(false);

    const hasError = !!error;

    // Keyboard type mapping
    const keyboardTypeMap: Record<string, TextInputProps['keyboardType']> = {
      email: 'email-address',
      phone: 'phone-pad',
      number: 'numeric',
    };

    const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const variantClasses = getVariantClasses(variant, isDark, hasError, isFocused);

    const inputContainerClasses = [
      'flex-row items-center',
      variantClasses,
      disabled ? 'opacity-50' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const textInputClasses = [
      'flex-1',
      sizeConfig.input,
      leftIcon ? 'pl-0' : '',
      rightIcon ? 'pr-0' : '',
      isDark ? 'text-foreground-dark' : 'text-foreground',
      inputClassName,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <View className={className} style={style} testID={testID}>
        {/* Label */}
        {label && (
          <View className="flex-row items-center mb-1.5">
            <Text
              className={`font-medium ${sizeConfig.label} ${
                hasError ? 'text-danger' : isDark ? 'text-foreground-dark' : 'text-foreground'
              } ${labelClassName}`}
              nativeID={`${uniqueId}-label`}
            >
              {label}
            </Text>
            {required && <Text className="text-danger ml-0.5">*</Text>}
            {optional && (
              <Text
                className={`ml-1 ${sizeConfig.helper} ${
                  isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'
                }`}
              >
                (optional)
              </Text>
            )}
          </View>
        )}

        {/* Input Container */}
        <View className={inputContainerClasses}>
          {leftIcon && (
            <View className="pl-3">
              <Ionicons
                name={leftIcon}
                size={sizeConfig.icon}
                color={
                  hasError
                    ? '#ef4444'
                    : isFocused
                      ? isDark
                        ? '#60a5fa'
                        : '#0a7ea4'
                      : isDark
                        ? '#9ca3af'
                        : '#6b7280'
                }
              />
            </View>
          )}

          <TextInput
            ref={ref}
            className={textInputClasses}
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            editable={!disabled}
            secureTextEntry={type === 'password'}
            keyboardType={keyboardTypeMap[type] || 'default'}
            autoCapitalize={type === 'email' ? 'none' : 'sentences'}
            autoComplete={type === 'email' ? 'email' : type === 'password' ? 'password' : 'off'}
            onFocus={handleFocus}
            onBlur={handleBlur}
            accessibilityLabel={label}
            accessibilityLabelledBy={label ? `${uniqueId}-label` : undefined}
            accessibilityState={{ disabled, selected: isFocused }}
            {...inputProps}
          />

          {rightIcon && (
            <View className="pr-3">
              {onRightIconPress ? (
                <Ionicons
                  name={rightIcon}
                  size={sizeConfig.icon}
                  color={isDark ? '#9ca3af' : '#6b7280'}
                  onPress={disabled ? undefined : onRightIconPress}
                />
              ) : (
                <Ionicons
                  name={rightIcon}
                  size={sizeConfig.icon}
                  color={isDark ? '#9ca3af' : '#6b7280'}
                />
              )}
            </View>
          )}
        </View>

        {/* Error or Helper Text */}
        {(error || helperText) && (
          <Text
            className={`mt-1.5 ${sizeConfig.helper} ${
              hasError
                ? 'text-danger'
                : isDark
                  ? 'text-foreground-dark-muted'
                  : 'text-foreground-muted'
            }`}
          >
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

FormField.displayName = 'FormField';

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * EmailField - Pre-configured for email input
 */
export const EmailField = forwardRef<TextInput, Omit<FormFieldProps, 'type' | 'leftIcon'>>(
  (props, ref) => (
    <FormField
      ref={ref}
      type="email"
      leftIcon="mail-outline"
      placeholder="email@example.com"
      {...props}
    />
  )
);
EmailField.displayName = 'EmailField';

/**
 * PasswordField - Pre-configured for password input with toggle
 */
export const PasswordField = forwardRef<TextInput, Omit<FormFieldProps, 'type'>>((props, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <FormField
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      leftIcon="lock-closed-outline"
      rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
      onRightIconPress={() => setShowPassword(!showPassword)}
      placeholder="Enter password"
      {...props}
    />
  );
});
PasswordField.displayName = 'PasswordField';

/**
 * SearchField - Pre-configured for search input
 */
export const SearchField = forwardRef<TextInput, Omit<FormFieldProps, 'leftIcon'>>((props, ref) => (
  <FormField ref={ref} leftIcon="search" placeholder="Search..." variant="filled" {...props} />
));
SearchField.displayName = 'SearchField';

/**
 * PhoneField - Pre-configured for phone input
 */
export const PhoneField = forwardRef<TextInput, Omit<FormFieldProps, 'type' | 'leftIcon'>>(
  (props, ref) => (
    <FormField
      ref={ref}
      type="phone"
      leftIcon="call-outline"
      placeholder="+1 (555) 000-0000"
      {...props}
    />
  )
);
PhoneField.displayName = 'PhoneField';

/**
 * TextArea - Multi-line text input
 */
export const TextArea = forwardRef<
  TextInput,
  Omit<FormFieldProps, 'multiline'> & { rows?: number }
>(({ rows = 4, ...props }, ref) => (
  <FormField
    ref={ref}
    multiline
    numberOfLines={rows}
    textAlignVertical="top"
    inputClassName="min-h-[100px]"
    {...props}
  />
));
TextArea.displayName = 'TextArea';

// ===========================================
// FORM FIELD GROUP
// ===========================================

export interface FormFieldGroupProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export function FormFieldGroup({
  children,
  label,
  error,
  helperText,
  className = '',
}: FormFieldGroupProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={className}>
      {label && (
        <Text
          className={`mb-3 text-sm font-semibold ${
            isDark ? 'text-foreground-dark' : 'text-foreground'
          }`}
        >
          {label}
        </Text>
      )}
      <View className="gap-4">{children}</View>
      {(error || helperText) && (
        <Text
          className={`mt-2 text-sm ${
            error ? 'text-danger' : isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'
          }`}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

// ===========================================
// INLINE FORM FIELDS
// ===========================================

export interface InlineFormFieldsProps {
  children: React.ReactNode;
  className?: string;
}

export function InlineFormFields({ children, className = '' }: InlineFormFieldsProps) {
  return (
    <View className={`flex-row gap-3 ${className}`}>
      {React.Children.map(children, (child) => (
        <View className="flex-1">{child}</View>
      ))}
    </View>
  );
}
