/**
 * Tabs Component
 *
 * Tab-based navigation for switching between views within a screen.
 *
 * @example
 * // Basic tabs
 * <Tabs
 *   tabs={[
 *     { key: 'overview', label: 'Overview' },
 *     { key: 'details', label: 'Details' },
 *     { key: 'settings', label: 'Settings' },
 *   ]}
 *   activeKey={activeTab}
 *   onChange={setActiveTab}
 * />
 *
 * // Tabs with content
 * <TabView
 *   tabs={[
 *     { key: 'tab1', label: 'Tab 1', content: <Tab1Content /> },
 *     { key: 'tab2', label: 'Tab 2', content: <Tab2Content /> },
 *   ]}
 * />
 *
 * // Tabs with icons and badges
 * <Tabs
 *   tabs={[
 *     { key: 'inbox', label: 'Inbox', icon: 'mail', badge: 5 },
 *     { key: 'sent', label: 'Sent', icon: 'send' },
 *   ]}
 *   activeKey={activeTab}
 *   onChange={setActiveTab}
 * />
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ===========================================
// TYPES
// ===========================================

export type TabVariant = 'underline' | 'pills' | 'enclosed' | 'soft';
export type TabSize = 'sm' | 'md' | 'lg';

export interface TabItem {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: TabVariant;
  size?: TabSize;
  fullWidth?: boolean;
  scrollable?: boolean;
  className?: string;
  style?: ViewStyle;
  testID?: string;
}

export interface TabViewProps {
  tabs: (TabItem & { content: React.ReactNode })[];
  defaultKey?: string;
  variant?: TabVariant;
  size?: TabSize;
  className?: string;
  contentClassName?: string;
}

export interface TabPanelProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

const sizeClasses: Record<TabSize, { tab: string; text: string; icon: number }> = {
  sm: { tab: 'py-2 px-3', text: 'text-sm', icon: 16 },
  md: { tab: 'py-2.5 px-4', text: 'text-base', icon: 18 },
  lg: { tab: 'py-3 px-5', text: 'text-lg', icon: 20 },
};

// ===========================================
// VARIANT CONFIGURATIONS
// ===========================================

const getVariantClasses = (
  variant: TabVariant,
  isActive: boolean,
  isDark: boolean
): { container: string; tab: string; text: string } => {
  const baseText = isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted';
  const activeText = isDark ? 'text-primary-400' : 'text-primary';

  switch (variant) {
    case 'underline':
      return {
        container: `border-b ${isDark ? 'border-border-dark' : 'border-border'}`,
        tab: isActive
          ? `border-b-2 ${isDark ? 'border-primary-400' : 'border-primary'} -mb-px`
          : 'border-b-2 border-transparent -mb-px',
        text: isActive ? activeText : baseText,
      };
    case 'pills':
      return {
        container: '',
        tab: isActive ? `${isDark ? 'bg-primary-500' : 'bg-primary'} rounded-full` : 'rounded-full',
        text: isActive ? 'text-white' : baseText,
      };
    case 'enclosed':
      return {
        container: `bg-background-secondary dark:bg-background-dark-tertiary rounded-xl p-1`,
        tab: isActive
          ? 'bg-white dark:bg-background-dark-secondary rounded-lg shadow-sm'
          : 'rounded-lg',
        text: isActive ? (isDark ? 'text-foreground-dark' : 'text-foreground') : baseText,
      };
    case 'soft':
      return {
        container: '',
        tab: isActive
          ? `${isDark ? 'bg-primary-500/20' : 'bg-primary/10'} rounded-lg`
          : 'rounded-lg',
        text: isActive ? activeText : baseText,
      };
    default:
      return { container: '', tab: '', text: baseText };
  }
};

// ===========================================
// MAIN TABS COMPONENT
// ===========================================

export function Tabs({
  tabs,
  activeKey,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  scrollable = false,
  className = '',
  style,
  testID,
}: TabsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const sizeConfig = sizeClasses[size];
  const variantClasses = getVariantClasses(variant, false, isDark);

  const [tabLayouts, setTabLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const indicatorWidthAnim = useRef(new Animated.Value(0)).current;

  // Animate indicator on tab change
  useEffect(() => {
    const activeLayout = tabLayouts[activeKey];
    if (activeLayout && variant === 'underline') {
      Animated.parallel([
        Animated.spring(indicatorAnim, {
          toValue: activeLayout.x,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.spring(indicatorWidthAnim, {
          toValue: activeLayout.width,
          useNativeDriver: false,
          tension: 100,
          friction: 10,
        }),
      ]).start();
    }
  }, [activeKey, tabLayouts, variant, indicatorAnim, indicatorWidthAnim]);

  const handleTabLayout = useCallback(
    (key: string) => (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      setTabLayouts((prev) => ({ ...prev, [key]: { x, width } }));
    },
    []
  );

  const renderTabs = () => (
    <View
      className={`flex-row ${fullWidth ? '' : ''} ${variantClasses.container} ${className}`}
      style={style}
      testID={testID}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        const tabVariantClasses = getVariantClasses(variant, isActive, isDark);

        return (
          <TouchableOpacity
            key={tab.key}
            className={`
              ${sizeConfig.tab}
              ${tabVariantClasses.tab}
              ${fullWidth ? 'flex-1 items-center' : ''}
              ${tab.disabled ? 'opacity-50' : ''}
            `}
            onPress={() => !tab.disabled && onChange(tab.key)}
            disabled={tab.disabled}
            onLayout={handleTabLayout(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <View className="flex-row items-center">
              {tab.icon && (
                <Ionicons
                  name={tab.icon}
                  size={sizeConfig.icon}
                  color={
                    isActive
                      ? variant === 'pills'
                        ? '#ffffff'
                        : isDark
                          ? '#60a5fa'
                          : '#0a7ea4'
                      : isDark
                        ? '#9ca3af'
                        : '#6b7280'
                  }
                  style={{ marginRight: 6 }}
                />
              )}
              <Text className={`${sizeConfig.text} font-medium ${tabVariantClasses.text}`}>
                {tab.label}
              </Text>
              {tab.badge !== undefined && (
                <View
                  className={`ml-2 px-1.5 py-0.5 rounded-full min-w-[20px] items-center ${
                    isActive
                      ? variant === 'pills'
                        ? 'bg-white/20'
                        : isDark
                          ? 'bg-primary-500/20'
                          : 'bg-primary/10'
                      : isDark
                        ? 'bg-background-dark-tertiary'
                        : 'bg-background-tertiary'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isActive && variant === 'pills'
                        ? 'text-white'
                        : isActive
                          ? isDark
                            ? 'text-primary-400'
                            : 'text-primary'
                          : isDark
                            ? 'text-foreground-dark-muted'
                            : 'text-foreground-muted'
                    }`}
                  >
                    {tab.badge}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {renderTabs()}
      </ScrollView>
    );
  }

  return renderTabs();
}

// ===========================================
// TAB PANEL COMPONENT
// ===========================================

export function TabPanel({ children, isActive, className = '' }: TabPanelProps) {
  if (!isActive) return null;
  return <View className={className}>{children}</View>;
}

// ===========================================
// TAB VIEW COMPONENT (Tabs + Content)
// ===========================================

export function TabView({
  tabs,
  defaultKey,
  variant = 'underline',
  size = 'md',
  className = '',
  contentClassName = '',
}: TabViewProps) {
  const [activeKey, setActiveKey] = useState(defaultKey || tabs[0]?.key || '');

  const activeTab = tabs.find((t) => t.key === activeKey);

  return (
    <View className={className}>
      <Tabs
        tabs={tabs}
        activeKey={activeKey}
        onChange={setActiveKey}
        variant={variant}
        size={size}
      />
      <View className={`mt-4 ${contentClassName}`}>{activeTab?.content}</View>
    </View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * IconTabs - Tabs with only icons
 */
export interface IconTabItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label?: string; // For accessibility
}

export interface IconTabsProps extends Omit<TabsProps, 'tabs'> {
  tabs: IconTabItem[];
}

export function IconTabs({ tabs, ...props }: IconTabsProps) {
  const mappedTabs: TabItem[] = tabs.map((t) => ({
    key: t.key,
    label: '',
    icon: t.icon,
  }));
  return <Tabs tabs={mappedTabs} {...props} />;
}

/**
 * ScrollableTabs - Horizontally scrollable tabs
 */
export function ScrollableTabs(props: TabsProps) {
  return <Tabs scrollable {...props} />;
}
