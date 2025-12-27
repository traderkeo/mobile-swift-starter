import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FormButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

/**
 * Variant styles using Tailwind classes
 */
const variantStyles: Record<
  NonNullable<FormButtonProps['variant']>,
  { container: string; text: string }
> = {
  primary: {
    container: 'bg-primary',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-foreground/10 dark:bg-foreground-dark/10',
    text: 'text-foreground dark:text-foreground-dark',
  },
  outline: {
    container: 'bg-transparent border border-foreground/30 dark:border-foreground-dark/30',
    text: 'text-foreground dark:text-foreground-dark',
  },
};

export function FormButton({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  className = '',
  ...props
}: FormButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const variantStyle = variantStyles[variant];

  return (
    <TouchableOpacity
      className={`h-14 rounded-lg justify-center items-center ${variantStyle.container} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : isDark ? '#ECEDEE' : '#11181C'}
        />
      ) : (
        <Text className={`text-base font-semibold ${variantStyle.text}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
