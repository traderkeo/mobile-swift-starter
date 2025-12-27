/**
 * Stepper component for multi-step flows, wizards, and onboarding
 *
 * Usage:
 * ```tsx
 * <Stepper
 *   steps={['Account', 'Profile', 'Confirm']}
 *   currentStep={1}
 *   onStepPress={(index) => setCurrentStep(index)}
 * />
 *
 * // Vertical stepper
 * <Stepper steps={steps} currentStep={2} variant="vertical" />
 *
 * // With icons
 * <Stepper
 *   steps={[
 *     { label: 'Cart', icon: 'cart' },
 *     { label: 'Shipping', icon: 'location' },
 *     { label: 'Payment', icon: 'card' },
 *   ]}
 *   currentStep={1}
 * />
 * ```
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Local color constants for stepper variants (match tailwind.config.js)
const STEPPER_COLORS: Record<string, string> = {
  primary: '#0a7ea4',
  secondary: '#6b7280',
  accent: '#8b5cf6',
  success: '#22c55e',
};

// Types
export interface StepItem {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  description?: string;
}

export type StepStatus = 'completed' | 'current' | 'upcoming';

export interface StepperProps {
  steps: (string | StepItem)[];
  currentStep: number;
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'success';
  showLabels?: boolean;
  showNumbers?: boolean;
  allowNavigation?: boolean;
  onStepPress?: (index: number) => void;
  className?: string;
}

export interface StepIndicatorProps {
  status: StepStatus;
  index: number;
  step: StepItem;
  size: 'sm' | 'md' | 'lg';
  color: string;
  showNumbers: boolean;
  isClickable: boolean;
  onPress?: () => void;
}

export interface StepConnectorProps {
  status: StepStatus;
  variant: 'horizontal' | 'vertical';
  color: string;
}

// Size configurations
const sizeConfig = {
  sm: { indicator: 24, icon: 12, font: 10, connector: 2, gap: 4 },
  md: { indicator: 32, icon: 16, font: 12, connector: 2, gap: 8 },
  lg: { indicator: 40, icon: 20, font: 14, connector: 3, gap: 12 },
};

// Helper to normalize step data
function normalizeStep(step: string | StepItem): StepItem {
  if (typeof step === 'string') {
    return { label: step };
  }
  return step;
}

// Step Indicator Component
function StepIndicator({
  status,
  index,
  step,
  size,
  color,
  showNumbers,
  isClickable,
  onPress,
}: StepIndicatorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfig[size];

  const getBackgroundColor = () => {
    switch (status) {
      case 'completed':
        return color;
      case 'current':
        return color;
      case 'upcoming':
        return isDark ? '#374151' : '#E5E7EB';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'completed':
      case 'current':
        return color;
      case 'upcoming':
        return isDark ? '#4B5563' : '#D1D5DB';
    }
  };

  const getContentColor = () => {
    switch (status) {
      case 'completed':
      case 'current':
        return '#FFFFFF';
      case 'upcoming':
        return isDark ? '#9CA3AF' : '#6B7280';
    }
  };

  const content = () => {
    if (status === 'completed' && !step.icon) {
      return <Ionicons name="checkmark" size={config.icon} color={getContentColor()} />;
    }
    if (step.icon) {
      return <Ionicons name={step.icon} size={config.icon} color={getContentColor()} />;
    }
    if (showNumbers) {
      return (
        <Text
          style={{
            fontSize: config.font,
            fontWeight: '600',
            color: getContentColor(),
          }}
        >
          {index + 1}
        </Text>
      );
    }
    return null;
  };

  const indicator = (
    <View
      style={{
        width: config.indicator,
        height: config.indicator,
        borderRadius: config.indicator / 2,
        backgroundColor: status === 'upcoming' ? 'transparent' : getBackgroundColor(),
        borderWidth: 2,
        borderColor: getBorderColor(),
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {content()}
    </View>
  );

  if (isClickable && onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {indicator}
      </TouchableOpacity>
    );
  }

  return indicator;
}

// Step Connector Component
function StepConnector({ status, variant, color }: StepConnectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = status === 'completed' ? color : isDark ? '#374151' : '#E5E7EB';

  if (variant === 'vertical') {
    return (
      <View
        style={{
          width: 2,
          height: 24,
          backgroundColor,
          marginLeft: 15,
        }}
      />
    );
  }

  return (
    <View
      style={{
        flex: 1,
        height: 2,
        backgroundColor,
        marginHorizontal: 8,
      }}
    />
  );
}

// Main Stepper Component
export function Stepper({
  steps,
  currentStep,
  variant = 'horizontal',
  size = 'md',
  color = 'primary',
  showLabels = true,
  showNumbers = true,
  allowNavigation = false,
  onStepPress,
  className = '',
}: StepperProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = sizeConfig[size];

  const colorValue = STEPPER_COLORS[color] || STEPPER_COLORS.primary;

  const normalizedSteps = steps.map(normalizeStep);

  const getStepStatus = (index: number): StepStatus => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const handleStepPress = (index: number) => {
    if (allowNavigation && onStepPress && index <= currentStep) {
      onStepPress(index);
    }
  };

  if (variant === 'vertical') {
    return (
      <View className={className}>
        {normalizedSteps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === normalizedSteps.length - 1;

          return (
            <View key={index}>
              <View className="flex-row items-start">
                <StepIndicator
                  status={status}
                  index={index}
                  step={step}
                  size={size}
                  color={colorValue}
                  showNumbers={showNumbers}
                  isClickable={allowNavigation && index <= currentStep}
                  onPress={() => handleStepPress(index)}
                />
                {showLabels && (
                  <View className="ml-3 flex-1 pt-1">
                    <Text
                      className={`font-semibold ${
                        status === 'upcoming'
                          ? isDark
                            ? 'text-gray-500'
                            : 'text-gray-400'
                          : isDark
                            ? 'text-white'
                            : 'text-gray-900'
                      }`}
                      style={{ fontSize: config.font + 2 }}
                    >
                      {step.label}
                    </Text>
                    {step.description && (
                      <Text
                        className={`mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                        style={{ fontSize: config.font }}
                      >
                        {step.description}
                      </Text>
                    )}
                  </View>
                )}
              </View>
              {!isLast && (
                <StepConnector
                  status={index < currentStep ? 'completed' : 'upcoming'}
                  variant="vertical"
                  color={colorValue}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  }

  // Horizontal variant
  return (
    <View className={className}>
      <View className="flex-row items-center">
        {normalizedSteps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === normalizedSteps.length - 1;

          return (
            <React.Fragment key={index}>
              <View className="items-center">
                <StepIndicator
                  status={status}
                  index={index}
                  step={step}
                  size={size}
                  color={colorValue}
                  showNumbers={showNumbers}
                  isClickable={allowNavigation && index <= currentStep}
                  onPress={() => handleStepPress(index)}
                />
              </View>
              {!isLast && (
                <StepConnector
                  status={index < currentStep ? 'completed' : 'upcoming'}
                  variant="horizontal"
                  color={colorValue}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
      {showLabels && (
        <View className="flex-row mt-2">
          {normalizedSteps.map((step, index) => {
            const status = getStepStatus(index);
            const isLast = index === normalizedSteps.length - 1;

            return (
              <React.Fragment key={index}>
                <View className="items-center" style={{ width: config.indicator }}>
                  <Text
                    className={`text-center ${
                      status === 'upcoming'
                        ? isDark
                          ? 'text-gray-500'
                          : 'text-gray-400'
                        : isDark
                          ? 'text-white'
                          : 'text-gray-900'
                    }`}
                    style={{ fontSize: config.font }}
                    numberOfLines={2}
                  >
                    {step.label}
                  </Text>
                </View>
                {!isLast && <View className="flex-1" />}
              </React.Fragment>
            );
          })}
        </View>
      )}
    </View>
  );
}

// Progress Stepper - simplified progress-only version
export interface ProgressStepperProps {
  totalSteps: number;
  currentStep: number;
  color?: 'primary' | 'secondary' | 'accent' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressStepper({
  totalSteps,
  currentStep,
  color = 'primary',
  size = 'md',
  className = '',
}: ProgressStepperProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colorValue = STEPPER_COLORS[color] || STEPPER_COLORS.primary;
  const config = sizeConfig[size];

  return (
    <View className={`flex-row items-center ${className}`}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === totalSteps - 1;

        return (
          <React.Fragment key={index}>
            <View
              style={{
                width: config.indicator * 0.5,
                height: config.indicator * 0.5,
                borderRadius: config.indicator * 0.25,
                backgroundColor:
                  isCompleted || isCurrent ? colorValue : isDark ? '#374151' : '#E5E7EB',
              }}
            />
            {!isLast && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: isCompleted ? colorValue : isDark ? '#374151' : '#E5E7EB',
                  marginHorizontal: 4,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// Step Container for wizard-style flows
export interface StepContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function StepContainer({
  children,
  title,
  description,
  className = '',
}: StepContainerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={`flex-1 ${className}`}>
      {(title || description) && (
        <View className="mb-6">
          {title && (
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </Text>
          )}
          {description && (
            <Text className={`mt-2 text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {description}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

// Wizard navigation buttons
export interface WizardNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  backLabel?: string;
  nextLabel?: string;
  skipLabel?: string;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  nextDisabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function WizardNavigation({
  onBack,
  onNext,
  onSkip,
  backLabel = 'Back',
  nextLabel = 'Next',
  skipLabel = 'Skip',
  isFirstStep = false,
  isLastStep = false,
  nextDisabled = false,
  loading = false,
  className = '',
}: WizardNavigationProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      <View className="flex-row items-center">
        {!isFirstStep && onBack && (
          <TouchableOpacity
            onPress={onBack}
            className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
          >
            <Text className={isDark ? 'text-white' : 'text-gray-900'}>{backLabel}</Text>
          </TouchableOpacity>
        )}
        {onSkip && !isLastStep && (
          <TouchableOpacity onPress={onSkip} className="px-4 py-2 ml-2">
            <Text className={isDark ? 'text-gray-400' : 'text-gray-500'}>{skipLabel}</Text>
          </TouchableOpacity>
        )}
      </View>

      {onNext && (
        <TouchableOpacity
          onPress={onNext}
          disabled={nextDisabled || loading}
          className={`px-6 py-3 rounded-lg ${
            nextDisabled || loading ? 'bg-gray-400' : 'bg-primary'
          }`}
        >
          <Text className="text-white font-semibold">
            {loading ? 'Loading...' : isLastStep ? 'Finish' : nextLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export type { StepItem as Step };
