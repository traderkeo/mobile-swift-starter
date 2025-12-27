/**
 * Accordion Component
 *
 * Collapsible content sections for FAQs, settings, and organized information.
 *
 * @example
 * // Single accordion item
 * <AccordionItem title="Question 1">
 *   <Text>Answer to question 1</Text>
 * </AccordionItem>
 *
 * // Accordion group (only one open at a time)
 * <Accordion>
 *   <AccordionItem title="Section 1">Content 1</AccordionItem>
 *   <AccordionItem title="Section 2">Content 2</AccordionItem>
 * </Accordion>
 *
 * // Accordion with custom styling
 * <AccordionItem
 *   title="Premium Features"
 *   icon="star"
 *   variant="filled"
 *   defaultOpen
 * >
 *   <FeatureList features={premiumFeatures} />
 * </AccordionItem>
 */

import React, { useState, useRef, useCallback, createContext, useContext } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ===========================================
// TYPES
// ===========================================

export type AccordionVariant = 'default' | 'filled' | 'outlined' | 'separated';

export interface AccordionItemProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  variant?: AccordionVariant;
  className?: string;
  testID?: string;
}

export interface AccordionProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
  defaultOpenIndex?: number;
  variant?: AccordionVariant;
  className?: string;
}

// ===========================================
// ACCORDION CONTEXT
// ===========================================

interface AccordionContextValue {
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
  allowMultiple: boolean;
  variant: AccordionVariant;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

// ===========================================
// VARIANT CONFIGURATIONS
// ===========================================

const variantClasses: Record<AccordionVariant, { container: string; header: string }> = {
  default: {
    container: '',
    header: 'border-b border-border dark:border-border-dark',
  },
  filled: {
    container: 'bg-background-secondary dark:bg-background-dark-tertiary rounded-xl mb-2',
    header: '',
  },
  outlined: {
    container: 'border border-border dark:border-border-dark rounded-xl mb-2',
    header: '',
  },
  separated: {
    container: 'bg-white dark:bg-background-dark-secondary rounded-xl mb-3 shadow-sm',
    header: '',
  },
};

// ===========================================
// ACCORDION ITEM COMPONENT
// ===========================================

export function AccordionItem({
  title,
  subtitle,
  children,
  icon,
  rightElement,
  defaultOpen = false,
  disabled = false,
  variant: itemVariant,
  className = '',
  testID,
}: AccordionItemProps) {
  const context = useContext(AccordionContext);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Use local state if not in Accordion context
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const isOpen = context ? context.openIndex !== null : localOpen;

  const rotateAnim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;
  const heightAnim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const variant = itemVariant || context?.variant || 'default';
  const variantStyle = variantClasses[variant];

  const toggle = useCallback(() => {
    if (disabled) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const newOpen = !isOpen;

    if (context) {
      // Managed by Accordion parent
      context.setOpenIndex(newOpen ? 0 : null);
    } else {
      setLocalOpen(newOpen);
    }

    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue: newOpen ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }),
      Animated.timing(heightAnim, {
        toValue: newOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isOpen, disabled, context, rotateAnim, heightAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const containerClasses = [variantStyle.container, disabled ? 'opacity-50' : '', className]
    .filter(Boolean)
    .join(' ');

  const headerClasses = ['flex-row items-center py-4 px-4', variantStyle.header]
    .filter(Boolean)
    .join(' ');

  return (
    <View className={containerClasses} testID={testID}>
      <TouchableOpacity
        className={headerClasses}
        onPress={toggle}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={`${title}, ${isOpen ? 'expanded' : 'collapsed'}`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isDark ? '#9ca3af' : '#6b7280'}
            style={{ marginRight: 12 }}
          />
        )}
        <View className="flex-1">
          <Text
            className={`text-base font-medium ${
              isDark ? 'text-foreground-dark' : 'text-foreground'
            }`}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              className={`text-sm mt-0.5 ${
                isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'
              }`}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {rightElement}
        <Animated.View style={{ transform: [{ rotate }], marginLeft: 8 }}>
          <Ionicons name="chevron-down" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
        </Animated.View>
      </TouchableOpacity>

      {isOpen && (
        <View className="px-4 pb-4">
          {icon && <View className="pl-8">{children}</View>}
          {!icon && children}
        </View>
      )}
    </View>
  );
}

// ===========================================
// ACCORDION GROUP COMPONENT
// ===========================================

export function Accordion({
  children,
  allowMultiple = false,
  defaultOpenIndex,
  variant = 'default',
  className = '',
}: AccordionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(
    defaultOpenIndex !== undefined ? new Set([defaultOpenIndex]) : new Set()
  );

  const handleToggle = (index: number) => {
    setOpenIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <View className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return (
          <AccordionContext.Provider
            value={{
              openIndex: openIndices.has(index) ? index : null,
              setOpenIndex: () => handleToggle(index),
              allowMultiple,
              variant,
            }}
          >
            {React.cloneElement(child as React.ReactElement<AccordionItemProps>, {
              variant: (child.props as AccordionItemProps).variant || variant,
            })}
          </AccordionContext.Provider>
        );
      })}
    </View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * FAQ Accordion - Styled for FAQ sections
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

export function FAQAccordion({ items, className = '' }: FAQAccordionProps) {
  return (
    <Accordion variant="separated" className={className}>
      {items.map((item, index) => (
        <AccordionItem key={index} title={item.question} icon="help-circle-outline">
          <Text className="text-foreground-muted dark:text-foreground-dark-muted leading-relaxed">
            {item.answer}
          </Text>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/**
 * Settings Accordion - Styled for settings sections
 */
export function SettingsAccordion({ children, ...props }: Omit<AccordionProps, 'variant'>) {
  return (
    <Accordion variant="filled" {...props}>
      {children}
    </Accordion>
  );
}
