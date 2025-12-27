/**
 * Timeline Component
 *
 * Visual representation of events or steps in chronological order.
 *
 * @example
 * // Basic timeline
 * <Timeline
 *   items={[
 *     { title: 'Order placed', description: 'Your order was received', time: '10:00 AM' },
 *     { title: 'Processing', description: 'Preparing your order', time: '10:30 AM' },
 *     { title: 'Shipped', description: 'On the way', time: '2:00 PM', status: 'current' },
 *     { title: 'Delivered', description: 'Arriving soon', status: 'pending' },
 *   ]}
 * />
 *
 * // With custom icons
 * <Timeline
 *   items={[
 *     { title: 'Account created', icon: 'person-add', status: 'completed' },
 *     { title: 'Email verified', icon: 'mail-open', status: 'completed' },
 *     { title: 'Profile setup', icon: 'create', status: 'current' },
 *   ]}
 * />
 */

import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ===========================================
// TYPES
// ===========================================

export type TimelineStatus = 'completed' | 'current' | 'pending' | 'error';
export type TimelineVariant = 'default' | 'compact' | 'alternating';
export type TimelineSize = 'sm' | 'md' | 'lg';

export interface TimelineItem {
  title: string;
  description?: string;
  time?: string;
  date?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  status?: TimelineStatus;
  content?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  variant?: TimelineVariant;
  size?: TimelineSize;
  showConnector?: boolean;
  className?: string;
  style?: ViewStyle;
  testID?: string;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

const sizeConfigs: Record<
  TimelineSize,
  {
    dot: number;
    icon: number;
    title: string;
    description: string;
    time: string;
    gap: number;
    lineWidth: number;
  }
> = {
  sm: {
    dot: 10,
    icon: 14,
    title: 'text-sm',
    description: 'text-xs',
    time: 'text-xs',
    gap: 12,
    lineWidth: 2,
  },
  md: {
    dot: 14,
    icon: 18,
    title: 'text-base',
    description: 'text-sm',
    time: 'text-sm',
    gap: 16,
    lineWidth: 2,
  },
  lg: {
    dot: 18,
    icon: 22,
    title: 'text-lg',
    description: 'text-base',
    time: 'text-base',
    gap: 20,
    lineWidth: 3,
  },
};

// ===========================================
// STATUS COLORS
// ===========================================

const getStatusColors = (status: TimelineStatus, isDark: boolean) => {
  switch (status) {
    case 'completed':
      return {
        dot: isDark ? '#22c55e' : '#16a34a',
        line: isDark ? '#22c55e' : '#16a34a',
        bg: isDark ? '#22c55e20' : '#16a34a20',
      };
    case 'current':
      return {
        dot: isDark ? '#60a5fa' : '#0a7ea4',
        line: isDark ? '#374151' : '#d1d5db',
        bg: isDark ? '#60a5fa20' : '#0a7ea420',
      };
    case 'error':
      return {
        dot: isDark ? '#ef4444' : '#dc2626',
        line: isDark ? '#374151' : '#d1d5db',
        bg: isDark ? '#ef444420' : '#dc262620',
      };
    case 'pending':
    default:
      return {
        dot: isDark ? '#4b5563' : '#9ca3af',
        line: isDark ? '#374151' : '#e5e7eb',
        bg: isDark ? '#4b556320' : '#9ca3af20',
      };
  }
};

// ===========================================
// MAIN TIMELINE COMPONENT
// ===========================================

export function Timeline({
  items,
  variant = 'default',
  size = 'md',
  showConnector = true,
  className = '',
  style,
  testID,
}: TimelineProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfigs[size];

  const renderItem = (item: TimelineItem, index: number) => {
    const status = item.status || (index === 0 ? 'completed' : 'pending');
    const colors = getStatusColors(status, isDark);
    const isLast = index === items.length - 1;
    const isAlternating = variant === 'alternating';
    const isRight = isAlternating && index % 2 === 1;

    const dotSize = item.icon ? config.dot + 8 : config.dot;

    const renderDot = () => (
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: item.icon ? colors.bg : colors.dot,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: item.icon ? 2 : 0,
          borderColor: colors.dot,
        }}
      >
        {item.icon && <Ionicons name={item.icon} size={config.icon} color={colors.dot} />}
        {status === 'current' && !item.icon && (
          <View
            style={{
              width: dotSize - 6,
              height: dotSize - 6,
              borderRadius: (dotSize - 6) / 2,
              backgroundColor: colors.dot,
            }}
          />
        )}
      </View>
    );

    const renderConnector = () => {
      if (isLast || !showConnector) return null;
      return (
        <View
          style={{
            width: config.lineWidth,
            flex: 1,
            minHeight: config.gap,
            backgroundColor: colors.line,
            marginLeft: (dotSize - config.lineWidth) / 2,
          }}
        />
      );
    };

    const renderContent = () => (
      <View className={`flex-1 ${variant === 'compact' ? 'pb-3' : 'pb-6'}`}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text
              className={`${config.title} font-semibold ${
                status === 'pending'
                  ? isDark
                    ? 'text-foreground-dark-muted'
                    : 'text-foreground-muted'
                  : isDark
                    ? 'text-foreground-dark'
                    : 'text-foreground'
              }`}
            >
              {item.title}
            </Text>
            {item.description && (
              <Text
                className={`${config.description} mt-0.5 ${
                  isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'
                }`}
              >
                {item.description}
              </Text>
            )}
          </View>
          {(item.time || item.date) && (
            <View className="ml-3 items-end">
              {item.time && (
                <Text
                  className={`${config.time} ${
                    isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'
                  }`}
                >
                  {item.time}
                </Text>
              )}
              {item.date && (
                <Text
                  className={`${config.time} ${
                    isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'
                  }`}
                >
                  {item.date}
                </Text>
              )}
            </View>
          )}
        </View>
        {item.content && <View className="mt-2">{item.content}</View>}
      </View>
    );

    if (variant === 'alternating') {
      return (
        <View key={index} className="flex-row">
          {/* Left content */}
          <View className="flex-1 items-end pr-4">{!isRight && renderContent()}</View>

          {/* Timeline */}
          <View className="items-center">
            {renderDot()}
            {renderConnector()}
          </View>

          {/* Right content */}
          <View className="flex-1 pl-4">{isRight && renderContent()}</View>
        </View>
      );
    }

    return (
      <View key={index} className="flex-row">
        <View className="items-center mr-3">
          {renderDot()}
          {renderConnector()}
        </View>
        {renderContent()}
      </View>
    );
  };

  return (
    <View className={className} style={style} testID={testID}>
      {items.map((item, index) => renderItem(item, index))}
    </View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * OrderTimeline - Pre-styled for order tracking
 */
export interface OrderTimelineProps {
  status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  className?: string;
}

const orderSteps: { key: string; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'placed', title: 'Order Placed', icon: 'receipt-outline' },
  { key: 'confirmed', title: 'Confirmed', icon: 'checkmark-circle-outline' },
  { key: 'processing', title: 'Processing', icon: 'cube-outline' },
  { key: 'shipped', title: 'Shipped', icon: 'car-outline' },
  { key: 'delivered', title: 'Delivered', icon: 'home-outline' },
];

export function OrderTimeline({ status, className = '' }: OrderTimelineProps) {
  const currentIndex = orderSteps.findIndex((step) => step.key === status);

  const items: TimelineItem[] = orderSteps.map((step, index) => ({
    title: step.title,
    icon: step.icon,
    status: index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'pending',
  }));

  return <Timeline items={items} className={className} />;
}

/**
 * ActivityTimeline - For activity feeds
 */
export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target?: string;
  timestamp: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface ActivityTimelineProps {
  activities: ActivityItem[];
  className?: string;
}

export function ActivityTimeline({ activities, className = '' }: ActivityTimelineProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const items: TimelineItem[] = activities.map((activity) => ({
    title: activity.user,
    description: `${activity.action}${activity.target ? ` ${activity.target}` : ''}`,
    time: activity.timestamp,
    icon: activity.icon,
    status: 'completed' as TimelineStatus,
  }));

  return <Timeline items={items} variant="compact" size="sm" className={className} />;
}

/**
 * StepTimeline - For multi-step processes
 */
export interface StepTimelineProps {
  steps: { title: string; description?: string }[];
  currentStep: number;
  className?: string;
}

export function StepTimeline({ steps, currentStep, className = '' }: StepTimelineProps) {
  const items: TimelineItem[] = steps.map((step, index) => ({
    title: step.title,
    description: step.description,
    status: index < currentStep ? 'completed' : index === currentStep ? 'current' : 'pending',
  }));

  return <Timeline items={items} className={className} />;
}

/**
 * HistoryTimeline - For event history
 */
export interface HistoryEvent {
  title: string;
  description?: string;
  date: string;
  time?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface HistoryTimelineProps {
  events: HistoryEvent[];
  className?: string;
}

export function HistoryTimeline({ events, className = '' }: HistoryTimelineProps) {
  const items: TimelineItem[] = events.map((event) => ({
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    status: event.type === 'error' ? 'error' : event.type === 'success' ? 'completed' : 'completed',
    icon:
      event.type === 'error'
        ? 'alert-circle'
        : event.type === 'warning'
          ? 'warning'
          : event.type === 'success'
            ? 'checkmark-circle'
            : 'information-circle',
  }));

  return <Timeline items={items} className={className} />;
}
