/**
 * Screen Component
 *
 * A screen wrapper component for consistent screen styling and layout.
 *
 * @example
 * // Basic screen
 * <Screen>
 *   <Text>Screen content</Text>
 * </Screen>
 *
 * // With header
 * <Screen>
 *   <ScreenHeader title="Settings" subtitle="Manage your preferences" />
 *   <ScreenContent>
 *     <Text>Content here</Text>
 *   </ScreenContent>
 * </Screen>
 *
 * // Scrollable screen
 * <Screen scrollable>
 *   <ScreenContent>
 *     <Text>Scrollable content</Text>
 *   </ScreenContent>
 * </Screen>
 *
 * // With safe area
 * <Screen safeArea>
 *   <Text>Safe area content</Text>
 * </Screen>
 *
 * // With keyboard avoiding
 * <Screen keyboardAvoiding>
 *   <Input label="Name" />
 * </Screen>
 */

import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
  type ViewStyle,
  type ScrollViewProps,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Text } from './Text';

// ===========================================
// TYPES
// ===========================================

export interface ScreenProps {
  children: React.ReactNode;
  /** Use SafeAreaView wrapper */
  safeArea?: boolean;
  /** Make content scrollable */
  scrollable?: boolean;
  /** Enable keyboard avoiding behavior */
  keyboardAvoiding?: boolean;
  /** Background variant */
  variant?: 'default' | 'secondary' | 'tertiary';
  /** Additional padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: ViewStyle;
  /** ScrollView props when scrollable */
  scrollViewProps?: ScrollViewProps;
  /** Status bar style */
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
}

// ===========================================
// CONFIGURATIONS
// ===========================================

const paddingClasses: Record<NonNullable<ScreenProps['padding']>, string> = {
  none: '',
  sm: 'px-3',
  md: 'px-4',
  lg: 'px-6',
};

const variantClasses: Record<
  NonNullable<ScreenProps['variant']>,
  { light: string; dark: string }
> = {
  default: {
    light: 'bg-background',
    dark: 'bg-background-dark',
  },
  secondary: {
    light: 'bg-background-secondary',
    dark: 'bg-background-dark-secondary',
  },
  tertiary: {
    light: 'bg-background-tertiary',
    dark: 'bg-background-dark-tertiary',
  },
};

// ===========================================
// SCREEN COMPONENT
// ===========================================

export function Screen({
  children,
  safeArea = true,
  scrollable = false,
  keyboardAvoiding = false,
  variant = 'default',
  padding = 'md',
  className = '',
  style,
  scrollViewProps,
  statusBarStyle,
}: ScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgClass = isDark ? variantClasses[variant].dark : variantClasses[variant].light;
  const paddingClass = paddingClasses[padding];

  // Determine status bar style
  const barStyle = statusBarStyle ?? (isDark ? 'light-content' : 'dark-content');

  // Build content
  let content = (
    <View className={`flex-1 ${paddingClass} ${className}`} style={style}>
      {children}
    </View>
  );

  // Wrap in ScrollView if scrollable
  if (scrollable) {
    content = (
      <ScrollView
        className="flex-1"
        contentContainerClassName={`${paddingClass} ${className}`}
        contentContainerStyle={style}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    );
  }

  // Wrap in KeyboardAvoidingView if needed
  if (keyboardAvoiding) {
    content = (
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  // Wrap in SafeAreaView if needed
  const Wrapper = safeArea ? SafeAreaView : View;

  return (
    <Wrapper className={`flex-1 ${bgClass}`}>
      <StatusBar barStyle={barStyle} />
      {content}
    </Wrapper>
  );
}

// ===========================================
// SCREEN HEADER COMPONENT
// ===========================================

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  largeTiitle?: boolean;
  className?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  largeTiitle = false,
  className = '',
}: ScreenHeaderProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View className={`mb-4 ${className}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {showBack && (
            <TouchableOpacity onPress={handleBack} className="mr-3 -ml-2 p-2" activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color={isDark ? '#ECEDEE' : '#11181C'} />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text variant={largeTiitle ? 'h1' : 'h3'} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text color="muted" size="sm" className="mt-0.5">
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {rightAction && <View className="ml-3">{rightAction}</View>}
      </View>
    </View>
  );
}

// ===========================================
// SCREEN CONTENT COMPONENT
// ===========================================

export interface ScreenContentProps {
  children: React.ReactNode;
  /** Add vertical spacing between children */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const spacingClasses: Record<NonNullable<ScreenContentProps['spacing']>, string> = {
  none: '',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function ScreenContent({ children, spacing = 'md', className = '' }: ScreenContentProps) {
  return <View className={`flex-1 ${spacingClasses[spacing]} ${className}`}>{children}</View>;
}

// ===========================================
// SCREEN FOOTER COMPONENT
// ===========================================

export interface ScreenFooterProps {
  children: React.ReactNode;
  /** Add border at top */
  bordered?: boolean;
  /** Add background */
  elevated?: boolean;
  className?: string;
}

export function ScreenFooter({
  children,
  bordered = false,
  elevated = false,
  className = '',
}: ScreenFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`px-4 pt-3 ${bordered ? 'border-t border-border dark:border-border-dark' : ''} ${
        elevated ? 'bg-background dark:bg-background-dark shadow-lg' : ''
      } ${className}`}
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      {children}
    </View>
  );
}

// ===========================================
// SCREEN SECTION COMPONENT
// ===========================================

export interface ScreenSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ScreenSection({
  children,
  title,
  subtitle,
  action,
  className = '',
}: ScreenSectionProps) {
  return (
    <View className={`mb-6 ${className}`}>
      {(title || action) && (
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            {title && (
              <Text weight="semibold" size="lg">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text color="muted" size="sm" className="mt-0.5">
                {subtitle}
              </Text>
            )}
          </View>
          {action && <View className="ml-3">{action}</View>}
        </View>
      )}
      {children}
    </View>
  );
}

// ===========================================
// DIVIDER COMPONENT
// ===========================================

export interface DividerProps {
  /** Add vertical margin */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Show label in center */
  label?: string;
  className?: string;
}

const dividerSpacingClasses: Record<NonNullable<DividerProps['spacing']>, string> = {
  none: '',
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
};

export function Divider({ spacing = 'md', label, className = '' }: DividerProps) {
  if (label) {
    return (
      <View className={`flex-row items-center ${dividerSpacingClasses[spacing]} ${className}`}>
        <View className="flex-1 h-px bg-border dark:bg-border-dark" />
        <Text color="muted" size="sm" className="mx-3">
          {label}
        </Text>
        <View className="flex-1 h-px bg-border dark:bg-border-dark" />
      </View>
    );
  }

  return (
    <View
      className={`h-px bg-border dark:bg-border-dark ${dividerSpacingClasses[spacing]} ${className}`}
    />
  );
}

// ===========================================
// SPACER COMPONENT
// ===========================================

export interface SpacerProps {
  /** Fixed size or flex */
  size?: number | 'flex';
}

export function Spacer({ size = 'flex' }: SpacerProps) {
  if (size === 'flex') {
    return <View className="flex-1" />;
  }
  return <View style={{ height: size, width: size }} />;
}
