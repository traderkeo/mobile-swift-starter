/**
 * Alert/Dialog component for confirmations, warnings, and prompts
 *
 * Usage:
 * ```tsx
 * // Basic alert
 * <Alert
 *   visible={showAlert}
 *   title="Delete Item"
 *   message="Are you sure you want to delete this item?"
 *   onClose={() => setShowAlert(false)}
 * />
 *
 * // Confirmation dialog
 * <ConfirmDialog
 *   visible={showConfirm}
 *   title="Confirm Action"
 *   message="This action cannot be undone."
 *   confirmLabel="Delete"
 *   confirmColor="danger"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowConfirm(false)}
 * />
 *
 * // Using AlertProvider (context-based)
 * const { alert, confirm } = useAlert();
 * await confirm({ title: 'Delete?', message: 'Sure?' });
 * ```
 */

import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSemanticColor } from '@/hooks/use-theme-color';

// Types
export type AlertType = 'info' | 'success' | 'warning' | 'danger';

export interface AlertButton {
  label: string;
  onPress?: () => void;
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  variant?: 'solid' | 'outline' | 'ghost';
}

export interface AlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  type?: AlertType;
  icon?: keyof typeof Ionicons.glyphMap;
  buttons?: AlertButton[];
  onClose: () => void;
  dismissable?: boolean;
  className?: string;
}

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: AlertType;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'danger' | 'success' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface PromptDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  inputType?: 'default' | 'email' | 'password' | 'number';
  validation?: (value: string) => string | null;
}

// Alert type icon configurations (colors will be provided by hooks)
const alertTypeIcons: Record<AlertType, keyof typeof Ionicons.glyphMap> = {
  info: 'information-circle',
  success: 'checkmark-circle',
  warning: 'warning',
  danger: 'alert-circle',
};

// Hook for alert colors
function useAlertColors() {
  const primary = useSemanticColor('primary');
  const secondary = useSemanticColor('secondary');
  const success = useSemanticColor('success');
  const warning = useSemanticColor('warning');
  const danger = useSemanticColor('danger');
  const info = useSemanticColor('info');

  return useMemo(
    () => ({
      primary,
      secondary,
      success,
      warning,
      danger,
      info,
    }),
    [primary, secondary, success, warning, danger, info]
  );
}

// Main Alert Component
export function Alert({
  visible,
  title,
  message,
  type = 'info',
  icon,
  buttons = [{ label: 'OK' }],
  onClose,
  dismissable = true,
  className = '',
}: AlertProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const alertColors = useAlertColors();
  const scaleValue = useRef(new Animated.Value(0.9)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleValue.setValue(0.9);
      opacityValue.setValue(0);
    }
  }, [visible, scaleValue, opacityValue]);

  if (!visible) return null;

  const typeColor = alertColors[type] || alertColors.info;
  const displayIcon = icon || alertTypeIcons[type];

  const getButtonStyle = (button: AlertButton, index: number) => {
    const color = button.color || (index === buttons.length - 1 ? 'primary' : 'secondary');
    const variant = button.variant || (index === buttons.length - 1 ? 'solid' : 'ghost');
    const colorValue = alertColors[color as keyof typeof alertColors] || alertColors.primary;

    if (variant === 'solid') {
      return {
        backgroundColor: colorValue,
        borderWidth: 0,
      };
    }
    if (variant === 'outline') {
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colorValue,
      };
    }
    return {
      backgroundColor: 'transparent',
      borderWidth: 0,
    };
  };

  const getButtonTextColor = (button: AlertButton, index: number) => {
    const color = button.color || (index === buttons.length - 1 ? 'primary' : 'secondary');
    const variant = button.variant || (index === buttons.length - 1 ? 'solid' : 'ghost');
    const colorValue = alertColors[color as keyof typeof alertColors] || alertColors.primary;

    if (variant === 'solid') {
      return '#FFFFFF';
    }
    return colorValue;
  };

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/50"
          activeOpacity={1}
          onPress={dismissable ? onClose : undefined}
        >
          <Animated.View
            style={{
              transform: [{ scale: scaleValue }],
              opacity: opacityValue,
            }}
          >
            <TouchableOpacity activeOpacity={1}>
              <View
                className={`mx-8 rounded-2xl overflow-hidden shadow-2xl ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } ${className}`}
                style={{ minWidth: 280, maxWidth: 340 }}
              >
                {/* Icon */}
                <View className="items-center pt-6 pb-2">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center"
                    style={{ backgroundColor: typeColor + '20' }}
                  >
                    <Ionicons name={displayIcon} size={32} color={typeColor} />
                  </View>
                </View>

                {/* Content */}
                <View className="px-6 pb-4">
                  {title && (
                    <Text
                      className={`text-lg font-bold text-center ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {title}
                    </Text>
                  )}
                  {message && (
                    <Text
                      className={`mt-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      {message}
                    </Text>
                  )}
                </View>

                {/* Buttons */}
                <View
                  className={`flex-row border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  {buttons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      className={`flex-1 py-4 items-center ${
                        index > 0
                          ? isDark
                            ? 'border-l border-gray-700'
                            : 'border-l border-gray-200'
                          : ''
                      }`}
                      style={getButtonStyle(button, index)}
                      onPress={() => {
                        button.onPress?.();
                        onClose();
                      }}
                    >
                      <Text
                        className="font-semibold"
                        style={{ color: getButtonTextColor(button, index) }}
                      >
                        {button.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Confirmation Dialog
export function ConfirmDialog({
  visible,
  title,
  message,
  type = 'warning',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Alert
      visible={visible}
      title={title}
      message={message}
      type={type}
      onClose={onCancel}
      dismissable={!loading}
      buttons={[
        { label: cancelLabel, variant: 'ghost', onPress: onCancel },
        {
          label: loading ? 'Loading...' : confirmLabel,
          color: confirmColor,
          variant: 'solid',
          onPress: loading ? undefined : onConfirm,
        },
      ]}
    />
  );
}

// Prompt Dialog
export function PromptDialog({
  visible,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onSubmit,
  onCancel,
  inputType = 'default',
  validation,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scaleValue = useRef(new Animated.Value(0.9)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setValue(defaultValue);
      setError(null);
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleValue.setValue(0.9);
      opacityValue.setValue(0);
    }
  }, [visible, defaultValue, scaleValue, opacityValue]);

  const handleSubmit = () => {
    if (validation) {
      const validationError = validation(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    onSubmit(value);
  };

  const getKeyboardType = () => {
    switch (inputType) {
      case 'email':
        return 'email-address';
      case 'number':
        return 'numeric';
      default:
        return 'default';
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/50"
          activeOpacity={1}
          onPress={onCancel}
        >
          <Animated.View
            style={{
              transform: [{ scale: scaleValue }],
              opacity: opacityValue,
            }}
          >
            <TouchableOpacity activeOpacity={1}>
              <View
                className={`mx-8 rounded-2xl overflow-hidden shadow-2xl ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
                style={{ minWidth: 300, maxWidth: 360 }}
              >
                {/* Content */}
                <View className="px-6 pt-6 pb-4">
                  <Text
                    className={`text-lg font-bold text-center ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {title}
                  </Text>
                  {message && (
                    <Text
                      className={`mt-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      {message}
                    </Text>
                  )}

                  {/* Input */}
                  <View className="mt-4">
                    <TextInput
                      className={`px-4 py-3 rounded-lg text-base ${
                        isDark
                          ? 'bg-gray-700 text-white border-gray-600'
                          : 'bg-gray-100 text-gray-900 border-gray-200'
                      } ${error ? 'border-2 border-danger' : 'border'}`}
                      value={value}
                      onChangeText={(text) => {
                        setValue(text);
                        setError(null);
                      }}
                      placeholder={placeholder}
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      keyboardType={getKeyboardType()}
                      secureTextEntry={inputType === 'password'}
                      autoFocus
                    />
                    {error && <Text className="mt-1 text-sm text-danger">{error}</Text>}
                  </View>
                </View>

                {/* Buttons */}
                <View
                  className={`flex-row border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <TouchableOpacity className="flex-1 py-4 items-center" onPress={onCancel}>
                    <Text className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {cancelLabel}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-4 items-center border-l ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}
                    onPress={handleSubmit}
                  >
                    <Text className="text-primary font-semibold">{submitLabel}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Context-based Alert System
interface AlertContextConfig {
  title?: string;
  message?: string;
  type?: AlertType;
  buttons?: AlertButton[];
}

interface ConfirmConfig {
  title: string;
  message?: string;
  type?: AlertType;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'danger' | 'success' | 'warning';
}

interface PromptConfig {
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
  cancelLabel?: string;
  inputType?: 'default' | 'email' | 'password' | 'number';
  validation?: (value: string) => string | null;
}

interface AlertContextType {
  alert: (config: AlertContextConfig) => Promise<void>;
  confirm: (config: ConfirmConfig) => Promise<boolean>;
  prompt: (config: PromptConfig) => Promise<string | null>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

interface AlertProviderProps {
  children: React.ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alertConfig, setAlertConfig] = useState<AlertContextConfig | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);

  const alertResolve = useRef<(() => void) | null>(null);
  const confirmResolve = useRef<((value: boolean) => void) | null>(null);
  const promptResolve = useRef<((value: string | null) => void) | null>(null);

  const alert = useCallback((config: AlertContextConfig): Promise<void> => {
    return new Promise((resolve) => {
      alertResolve.current = resolve;
      setAlertConfig(config);
    });
  }, []);

  const confirm = useCallback((config: ConfirmConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmResolve.current = resolve;
      setConfirmConfig(config);
    });
  }, []);

  const prompt = useCallback((config: PromptConfig): Promise<string | null> => {
    return new Promise((resolve) => {
      promptResolve.current = resolve;
      setPromptConfig(config);
    });
  }, []);

  const handleAlertClose = () => {
    setAlertConfig(null);
    alertResolve.current?.();
    alertResolve.current = null;
  };

  const handleConfirm = () => {
    setConfirmConfig(null);
    confirmResolve.current?.(true);
    confirmResolve.current = null;
  };

  const handleConfirmCancel = () => {
    setConfirmConfig(null);
    confirmResolve.current?.(false);
    confirmResolve.current = null;
  };

  const handlePromptSubmit = (value: string) => {
    setPromptConfig(null);
    promptResolve.current?.(value);
    promptResolve.current = null;
  };

  const handlePromptCancel = () => {
    setPromptConfig(null);
    promptResolve.current?.(null);
    promptResolve.current = null;
  };

  return (
    <AlertContext.Provider value={{ alert, confirm, prompt }}>
      {children}

      {/* Alert Modal */}
      <Alert
        visible={!!alertConfig}
        title={alertConfig?.title}
        message={alertConfig?.message}
        type={alertConfig?.type}
        buttons={alertConfig?.buttons || [{ label: 'OK' }]}
        onClose={handleAlertClose}
      />

      {/* Confirm Modal */}
      {confirmConfig && (
        <ConfirmDialog
          visible={!!confirmConfig}
          title={confirmConfig.title}
          message={confirmConfig.message}
          type={confirmConfig.type}
          confirmLabel={confirmConfig.confirmLabel}
          cancelLabel={confirmConfig.cancelLabel}
          confirmColor={confirmConfig.confirmColor}
          onConfirm={handleConfirm}
          onCancel={handleConfirmCancel}
        />
      )}

      {/* Prompt Modal */}
      {promptConfig && (
        <PromptDialog
          visible={!!promptConfig}
          title={promptConfig.title}
          message={promptConfig.message}
          placeholder={promptConfig.placeholder}
          defaultValue={promptConfig.defaultValue}
          submitLabel={promptConfig.submitLabel}
          cancelLabel={promptConfig.cancelLabel}
          inputType={promptConfig.inputType}
          validation={promptConfig.validation}
          onSubmit={handlePromptSubmit}
          onCancel={handlePromptCancel}
        />
      )}
    </AlertContext.Provider>
  );
}

// Convenience components for common alerts
export function DeleteConfirmDialog({
  visible,
  itemName = 'this item',
  onConfirm,
  onCancel,
  loading,
}: {
  visible: boolean;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      visible={visible}
      type="danger"
      title="Delete Item"
      message={`Are you sure you want to delete ${itemName}? This action cannot be undone.`}
      confirmLabel="Delete"
      confirmColor="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    />
  );
}

export function DiscardChangesDialog({
  visible,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ConfirmDialog
      visible={visible}
      type="warning"
      title="Discard Changes"
      message="You have unsaved changes. Are you sure you want to discard them?"
      confirmLabel="Discard"
      confirmColor="danger"
      cancelLabel="Keep Editing"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export function LogoutConfirmDialog({
  visible,
  onConfirm,
  onCancel,
  loading,
}: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      visible={visible}
      type="info"
      title="Sign Out"
      message="Are you sure you want to sign out of your account?"
      confirmLabel="Sign Out"
      confirmColor="primary"
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    />
  );
}
