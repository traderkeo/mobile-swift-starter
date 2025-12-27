import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FormInputProps<T extends FieldValues> extends Omit<
  TextInputProps,
  'value' | 'onChangeText'
> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  className?: string;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  icon,
  isPassword = false,
  className = '',
  ...textInputProps
}: FormInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const placeholderColor = isDark ? '#ECEDEE99' : '#11181C99';
  const errorColor = '#ef4444';

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className={`mb-4 ${className}`}>
          {label && (
            <Text className="text-sm font-semibold mb-2 text-foreground dark:text-foreground-dark">
              {label}
            </Text>
          )}
          <View className="flex-row items-center relative">
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color={error ? errorColor : textColor}
                style={{ position: 'absolute', left: 16, zIndex: 1 }}
              />
            )}
            <TextInput
              className={`flex-1 h-14 border rounded-lg text-base ${
                isDark ? 'text-foreground-dark' : 'text-foreground'
              }`}
              style={{
                borderColor: error ? errorColor : isDark ? '#ECEDEE4D' : '#11181C4D',
                paddingLeft: icon ? 48 : 16,
                paddingRight: isPassword ? 48 : 16,
              }}
              placeholderTextColor={placeholderColor}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={isPassword && !showPassword}
              autoCapitalize={isPassword ? 'none' : textInputProps.autoCapitalize}
              {...textInputProps}
            />
            {isPassword && (
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4"
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={textColor}
                />
              </TouchableOpacity>
            )}
          </View>
          {error && <Text className="text-xs mt-1 ml-1 text-danger">{error.message}</Text>}
        </View>
      )}
    />
  );
}
