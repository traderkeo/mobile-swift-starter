/**
 * Select Component
 *
 * A dropdown select component using bottom sheet for mobile-friendly selection.
 *
 * @example
 * // Basic usage
 * <Select
 *   value={country}
 *   onValueChange={setCountry}
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' },
 *     { value: 'ca', label: 'Canada' },
 *   ]}
 * />
 *
 * // With label and placeholder
 * <Select
 *   label="Country"
 *   placeholder="Select a country"
 *   value={country}
 *   onValueChange={setCountry}
 *   options={countries}
 * />
 *
 * // With icons
 * <Select
 *   value={sort}
 *   onValueChange={setSort}
 *   options={[
 *     { value: 'newest', label: 'Newest first', icon: 'time-outline' },
 *     { value: 'popular', label: 'Most popular', icon: 'flame-outline' },
 *   ]}
 * />
 *
 * // Searchable
 * <Select
 *   searchable
 *   value={city}
 *   onValueChange={setCity}
 *   options={cities}
 * />
 *
 * // Variants
 * <Select variant="outlined" ... />
 * <Select variant="filled" ... />
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Text } from './Text';

// ===========================================
// TYPES
// ===========================================

export type SelectVariant = 'outlined' | 'filled';
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export interface SelectProps {
  value: string | null;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Modal title (defaults to label) */
  title?: string;
  className?: string;
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
}

const sizeConfigs: Record<SelectSize, SizeConfig> = {
  sm: {
    height: 'h-9',
    padding: 'px-3',
    fontSize: 'text-sm',
    labelSize: 'text-xs',
    iconSize: 16,
  },
  md: {
    height: 'h-11',
    padding: 'px-4',
    fontSize: 'text-base',
    labelSize: 'text-sm',
    iconSize: 18,
  },
  lg: {
    height: 'h-14',
    padding: 'px-4',
    fontSize: 'text-lg',
    labelSize: 'text-sm',
    iconSize: 20,
  },
};

// ===========================================
// VARIANT CONFIGURATIONS
// ===========================================

const variantClasses: Record<SelectVariant, { light: string; dark: string }> = {
  outlined: {
    light: 'border border-border bg-transparent',
    dark: 'border border-border-dark bg-transparent',
  },
  filled: {
    light: 'bg-background-secondary border-0',
    dark: 'bg-background-dark-tertiary border-0',
  },
};

// ===========================================
// COMPONENT
// ===========================================

export function Select({
  value,
  onValueChange,
  options,
  label,
  placeholder = 'Select an option',
  variant = 'outlined',
  size = 'md',
  disabled = false,
  error,
  helperText,
  searchable = false,
  searchPlaceholder = 'Search...',
  title,
  className = '',
  style,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const sizeConfig = sizeConfigs[size];

  // Get selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

  // Colors
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const placeholderColor = isDark ? '#687076' : '#9BA1A6';
  const iconColor = error ? '#ef4444' : isDark ? '#9BA1A6' : '#687076';

  const variantStyle = isDark ? variantClasses[variant].dark : variantClasses[variant].light;

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <View className={className} style={style}>
      {/* Label */}
      {label && (
        <Text
          className={`${sizeConfig.labelSize} font-medium mb-1.5 ${error ? 'text-danger' : ''}`}
          color={error ? 'danger' : 'default'}
        >
          {label}
        </Text>
      )}

      {/* Trigger */}
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
        className={`flex-row items-center justify-between rounded-lg ${sizeConfig.height} ${sizeConfig.padding} ${variantStyle} ${
          error ? 'border-danger' : ''
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <View className="flex-row items-center flex-1">
          {selectedOption?.icon && (
            <Ionicons
              name={selectedOption.icon}
              size={sizeConfig.iconSize}
              color={textColor}
              style={{ marginRight: 8 }}
            />
          )}
          <Text className={sizeConfig.fontSize} color={selectedOption ? 'default' : 'subtle'}>
            {selectedOption?.label || placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={sizeConfig.iconSize} color={iconColor} />
      </TouchableOpacity>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <Text size="xs" color={error ? 'danger' : 'muted'} className="mt-1.5 ml-1">
          {error || helperText}
        </Text>
      )}

      {/* Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          {/* Backdrop */}
          <TouchableOpacity
            className="flex-1 bg-black/50"
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <View
            className="bg-background dark:bg-background-dark rounded-t-3xl"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            {/* Handle */}
            <View className="items-center py-3">
              <View className="w-10 h-1 rounded-full bg-secondary-300 dark:bg-secondary-700" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pb-3 border-b border-border dark:border-border-dark">
              <Text variant="h4">{title || label || 'Select'}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} className="p-2 -mr-2">
                <Ionicons name="close" size={24} color={isDark ? '#9BA1A6' : '#687076'} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            {searchable && (
              <View className="px-4 py-3 border-b border-border dark:border-border-dark">
                <View className="flex-row items-center bg-background-secondary dark:bg-background-dark-tertiary rounded-lg px-3 h-10">
                  <Ionicons name="search" size={18} color={placeholderColor} />
                  <TextInput
                    className="flex-1 ml-2 text-base"
                    style={{ color: textColor }}
                    placeholder={searchPlaceholder}
                    placeholderTextColor={placeholderColor}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={18} color={placeholderColor} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Options */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    onPress={() => !item.disabled && handleSelect(item.value)}
                    disabled={item.disabled}
                    className={`flex-row items-center px-4 py-3 ${
                      item.disabled ? 'opacity-50' : ''
                    }`}
                    activeOpacity={0.7}
                  >
                    {item.icon && (
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={isSelected ? '#0a7ea4' : textColor}
                        style={{ marginRight: 12 }}
                      />
                    )}
                    <Text
                      className="flex-1"
                      color={isSelected ? 'primary' : 'default'}
                      weight={isSelected ? 'semibold' : 'normal'}
                    >
                      {item.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={20} color="#0a7ea4" />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Text color="muted">No options found</Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ===========================================
// MULTI SELECT COMPONENT
// ===========================================

export interface MultiSelectProps extends Omit<SelectProps, 'value' | 'onValueChange'> {
  value: string[];
  onValueChange: (value: string[]) => void;
  /** Maximum selections allowed */
  max?: number;
}

export function MultiSelect({
  value,
  onValueChange,
  options,
  label,
  placeholder = 'Select options',
  max,
  ...props
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label)
    .join(', ');

  const textColor = isDark ? '#ECEDEE' : '#11181C';

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onValueChange(value.filter((v) => v !== optionValue));
    } else {
      if (max && value.length >= max) return;
      onValueChange([...value, optionValue]);
    }
  };

  return (
    <View className={props.className} style={props.style}>
      {/* Label */}
      {label && <Text className="text-sm font-medium mb-1.5">{label}</Text>}

      {/* Trigger */}
      <TouchableOpacity
        onPress={() => !props.disabled && setIsOpen(true)}
        disabled={props.disabled}
        activeOpacity={0.7}
        className={`flex-row items-center justify-between rounded-lg h-11 px-4 border border-border dark:border-border-dark ${
          props.disabled ? 'opacity-50' : ''
        }`}
      >
        <Text className="flex-1" color={value.length > 0 ? 'default' : 'subtle'} numberOfLines={1}>
          {value.length > 0 ? selectedLabels : placeholder}
        </Text>
        <View className="flex-row items-center">
          {value.length > 0 && (
            <View className="bg-primary rounded-full px-2 py-0.5 mr-2">
              <Text size="xs" color="white" weight="semibold">
                {value.length}
              </Text>
            </View>
          )}
          <Ionicons name="chevron-down" size={18} color={isDark ? '#9BA1A6' : '#687076'} />
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        />
        <View
          className="bg-background dark:bg-background-dark rounded-t-3xl"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="items-center py-3">
            <View className="w-10 h-1 rounded-full bg-secondary-300 dark:bg-secondary-700" />
          </View>

          <View className="flex-row items-center justify-between px-4 pb-3 border-b border-border dark:border-border-dark">
            <Text variant="h4">{label || 'Select'}</Text>
            <TouchableOpacity onPress={() => setIsOpen(false)} className="p-2 -mr-2">
              <Ionicons name="close" size={24} color={isDark ? '#9BA1A6' : '#687076'} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            style={{ maxHeight: 300 }}
            renderItem={({ item }) => {
              const isSelected = value.includes(item.value);
              const isDisabled =
                item.disabled || (max !== undefined && value.length >= max && !isSelected);
              return (
                <TouchableOpacity
                  onPress={() => !isDisabled && handleToggle(item.value)}
                  disabled={isDisabled}
                  className={`flex-row items-center px-4 py-3 ${isDisabled ? 'opacity-50' : ''}`}
                  activeOpacity={0.7}
                >
                  <View
                    className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-secondary-300 dark:border-secondary-600'
                    }`}
                  >
                    {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text className="flex-1">{item.label}</Text>
                </TouchableOpacity>
              );
            }}
          />

          {max && (
            <Text size="sm" color="muted" className="px-4 pt-2">
              {value.length} / {max} selected
            </Text>
          )}
        </View>
      </Modal>
    </View>
  );
}
