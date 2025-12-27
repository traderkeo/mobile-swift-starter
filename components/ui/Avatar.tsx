/**
 * Avatar Component
 *
 * A versatile avatar component for user images, initials, or icons.
 *
 * @example
 * // With image
 * <Avatar source={{ uri: 'https://example.com/photo.jpg' }} />
 *
 * // With initials
 * <Avatar name="John Doe" />
 *
 * // With icon
 * <Avatar icon="person" />
 *
 * // Sizes
 * <Avatar size="xs" name="JD" />
 * <Avatar size="sm" name="JD" />
 * <Avatar size="md" name="JD" />
 * <Avatar size="lg" name="JD" />
 * <Avatar size="xl" name="JD" />
 * <Avatar size="2xl" name="JD" />
 *
 * // Shapes
 * <Avatar name="JD" shape="circle" />
 * <Avatar name="JD" shape="rounded" />
 * <Avatar name="JD" shape="square" />
 *
 * // With status indicator
 * <Avatar name="JD" status="online" />
 * <Avatar name="JD" status="offline" />
 * <Avatar name="JD" status="busy" />
 * <Avatar name="JD" status="away" />
 *
 * // Color variants (for initials)
 * <Avatar name="John Doe" color="primary" />
 * <Avatar name="Jane Smith" color="accent" />
 *
 * // Avatar group
 * <AvatarGroup max={3}>
 *   <Avatar source={{ uri: '...' }} />
 *   <Avatar name="JD" />
 *   <Avatar name="AS" />
 *   <Avatar name="BC" />
 * </AvatarGroup>
 *
 * // Pressable
 * <Avatar name="JD" onPress={() => console.log('pressed')} />
 */

import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  type ImageSourcePropType,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ===========================================
// TYPES
// ===========================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'rounded' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
export type AvatarColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: AvatarSize;
  shape?: AvatarShape;
  color?: AvatarColor;
  status?: AvatarStatus;
  bordered?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

interface SizeConfig {
  container: number;
  fontSize: string;
  iconSize: number;
  statusSize: number;
  borderWidth: number;
}

const sizeConfigs: Record<AvatarSize, SizeConfig> = {
  xs: { container: 24, fontSize: 'text-[10px]', iconSize: 12, statusSize: 6, borderWidth: 1 },
  sm: { container: 32, fontSize: 'text-xs', iconSize: 16, statusSize: 8, borderWidth: 2 },
  md: { container: 40, fontSize: 'text-sm', iconSize: 18, statusSize: 10, borderWidth: 2 },
  lg: { container: 48, fontSize: 'text-base', iconSize: 22, statusSize: 12, borderWidth: 2 },
  xl: { container: 64, fontSize: 'text-xl', iconSize: 28, statusSize: 14, borderWidth: 3 },
  '2xl': { container: 80, fontSize: 'text-2xl', iconSize: 36, statusSize: 16, borderWidth: 3 },
};

// ===========================================
// COLOR CONFIGURATIONS
// ===========================================

const colorConfigs: Record<AvatarColor, { bg: string; text: string }> = {
  primary: {
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    text: 'text-primary-700 dark:text-primary-300',
  },
  secondary: {
    bg: 'bg-secondary-100 dark:bg-secondary-800',
    text: 'text-secondary-700 dark:text-secondary-200',
  },
  accent: {
    bg: 'bg-accent-100 dark:bg-accent-900/30',
    text: 'text-accent-700 dark:text-accent-300',
  },
  success: {
    bg: 'bg-success/10 dark:bg-success/20',
    text: 'text-success-dark dark:text-success-light',
  },
  warning: {
    bg: 'bg-warning/10 dark:bg-warning/20',
    text: 'text-warning-dark dark:text-warning-light',
  },
  danger: { bg: 'bg-danger/10 dark:bg-danger/20', text: 'text-danger-dark dark:text-danger-light' },
  info: { bg: 'bg-info/10 dark:bg-info/20', text: 'text-info-dark dark:text-info-light' },
};

// ===========================================
// STATUS CONFIGURATIONS
// ===========================================

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-success',
  offline: 'bg-secondary-400',
  busy: 'bg-danger',
  away: 'bg-warning',
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get initials from a name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a color based on name (for consistent colors per user)
 */
function getColorFromName(name: string): AvatarColor {
  const colors: AvatarColor[] = ['primary', 'accent', 'success', 'warning', 'info'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ===========================================
// SHAPE CONFIGURATIONS
// ===========================================

const shapeClasses: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-xl',
  square: 'rounded-none',
};

// ===========================================
// COMPONENT
// ===========================================

export function Avatar({
  source,
  name,
  icon,
  size = 'md',
  shape = 'circle',
  color,
  status,
  bordered = false,
  onPress,
  disabled = false,
  className = '',
  style,
}: AvatarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const sizeConfig = sizeConfigs[size];

  // Determine color (auto-generate from name if not specified)
  const resolvedColor = color ?? (name ? getColorFromName(name) : 'secondary');
  const colorConfig = colorConfigs[resolvedColor];

  // Build container classes
  const containerClasses = [
    'items-center justify-center overflow-hidden',
    shapeClasses[shape],
    bordered ? `border-${sizeConfig.borderWidth} border-white dark:border-background-dark` : '',
    disabled ? 'opacity-50' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Content based on props
  const renderContent = () => {
    // Image source provided
    if (source) {
      return (
        <Image
          source={source}
          style={{
            width: sizeConfig.container,
            height: sizeConfig.container,
          }}
          resizeMode="cover"
        />
      );
    }

    // Icon fallback
    if (icon) {
      const iconColor = isDark ? '#9BA1A6' : '#687076';
      return (
        <View
          className={`items-center justify-center bg-secondary-100 dark:bg-secondary-800`}
          style={{
            width: sizeConfig.container,
            height: sizeConfig.container,
          }}
        >
          <Ionicons name={icon} size={sizeConfig.iconSize} color={iconColor} />
        </View>
      );
    }

    // Name initials
    if (name) {
      return (
        <View
          className={`items-center justify-center ${colorConfig.bg}`}
          style={{
            width: sizeConfig.container,
            height: sizeConfig.container,
          }}
        >
          <Text className={`${sizeConfig.fontSize} font-semibold ${colorConfig.text}`}>
            {getInitials(name)}
          </Text>
        </View>
      );
    }

    // Default fallback (person icon)
    const iconColor = isDark ? '#9BA1A6' : '#687076';
    return (
      <View
        className="items-center justify-center bg-secondary-100 dark:bg-secondary-800"
        style={{
          width: sizeConfig.container,
          height: sizeConfig.container,
        }}
      >
        <Ionicons name="person" size={sizeConfig.iconSize} color={iconColor} />
      </View>
    );
  };

  // Status indicator position
  const renderStatus = () => {
    if (!status) return null;

    const statusStyle: ViewStyle = {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: sizeConfig.statusSize,
      height: sizeConfig.statusSize,
      borderRadius: sizeConfig.statusSize / 2,
      borderWidth: 2,
      borderColor: isDark ? '#151718' : '#ffffff',
    };

    return <View className={statusColors[status]} style={statusStyle} />;
  };

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, disabled, activeOpacity: 0.7 } : {};

  return (
    <Wrapper
      className={containerClasses}
      style={[
        {
          width: sizeConfig.container,
          height: sizeConfig.container,
        },
        style,
      ]}
      {...wrapperProps}
    >
      {renderContent()}
      {renderStatus()}
    </Wrapper>
  );
}

// ===========================================
// AVATAR GROUP COMPONENT
// ===========================================

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  spacing?: number;
  className?: string;
}

export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  spacing = -8,
  className = '',
}: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const visibleAvatars = childArray.slice(0, max);
  const remainingCount = childArray.length - max;
  const sizeConfig = sizeConfigs[size];

  return (
    <View className={`flex-row items-center ${className}`}>
      {visibleAvatars.map((child, index) => (
        <View
          key={index}
          style={{
            marginLeft: index === 0 ? 0 : spacing,
            zIndex: visibleAvatars.length - index,
          }}
        >
          {React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size, bordered: true })
            : child}
        </View>
      ))}
      {remainingCount > 0 && (
        <View
          className="items-center justify-center bg-secondary-200 dark:bg-secondary-700 rounded-full border-2 border-white dark:border-background-dark"
          style={{
            width: sizeConfig.container,
            height: sizeConfig.container,
            marginLeft: spacing,
            zIndex: 0,
          }}
        >
          <Text
            className={`${sizeConfig.fontSize} font-semibold text-secondary-700 dark:text-secondary-200`}
          >
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * User Avatar - Avatar with online status
 */
export interface UserAvatarProps extends Omit<AvatarProps, 'icon'> {
  isOnline?: boolean;
}

export function UserAvatar({ isOnline, ...props }: UserAvatarProps) {
  return <Avatar status={isOnline ? 'online' : undefined} {...props} />;
}

/**
 * Placeholder Avatar - For loading states
 */
export function PlaceholderAvatar({
  size = 'md',
  shape = 'circle',
  className = '',
}: Pick<AvatarProps, 'size' | 'shape' | 'className'>) {
  const sizeConfig = sizeConfigs[size];
  return (
    <View
      className={`bg-secondary-200 dark:bg-secondary-700 animate-pulse ${shapeClasses[shape]} ${className}`}
      style={{
        width: sizeConfig.container,
        height: sizeConfig.container,
      }}
    />
  );
}
