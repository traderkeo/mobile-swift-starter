/**
 * Modal Component
 *
 * A flexible modal dialog component with customizable appearance and behavior.
 *
 * @example
 * // Basic modal
 * <Modal visible={isOpen} onClose={() => setIsOpen(false)}>
 *   <Text>Modal content</Text>
 * </Modal>
 *
 * // Modal with title and footer
 * <Modal
 *   visible={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   footer={
 *     <>
 *       <Button variant="ghost" onPress={() => setIsOpen(false)}>Cancel</Button>
 *       <Button onPress={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   <Text>Are you sure you want to proceed?</Text>
 * </Modal>
 *
 * // Full screen modal
 * <Modal visible={isOpen} onClose={onClose} size="full">
 *   <FullScreenContent />
 * </Modal>
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ===========================================
// TYPES
// ===========================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalPosition = 'center' | 'bottom' | 'top';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  size?: ModalSize;
  position?: ModalPosition;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  animationType?: 'none' | 'fade' | 'slide';
  scrollable?: boolean;
  avoidKeyboard?: boolean;
  className?: string;
  contentClassName?: string;
  style?: ViewStyle;
  testID?: string;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

const sizeClasses: Record<ModalSize, string> = {
  sm: 'w-[280px] max-h-[60%]',
  md: 'w-[340px] max-h-[70%]',
  lg: 'w-[400px] max-h-[80%]',
  xl: 'w-[90%] max-h-[85%]',
  full: 'w-full h-full',
};

const positionClasses: Record<ModalPosition, string> = {
  center: 'justify-center items-center',
  bottom: 'justify-end items-center',
  top: 'justify-start items-center pt-20',
};

// ===========================================
// MAIN MODAL COMPONENT
// ===========================================

export function Modal({
  visible,
  onClose,
  children,
  title,
  subtitle,
  footer,
  size = 'md',
  position = 'center',
  closeOnBackdrop = true,
  showCloseButton = true,
  animationType = 'fade',
  scrollable = true,
  avoidKeyboard = true,
  className = '',
  contentClassName = '',
  style,
  testID,
}: ModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const isFullScreen = size === 'full';
  const borderRadius = isFullScreen ? '' : 'rounded-2xl';
  const margin = position === 'bottom' ? 'mb-0 rounded-b-none' : '';

  const containerClasses = [
    isFullScreen ? '' : sizeClasses[size],
    borderRadius,
    margin,
    isDark ? 'bg-background-dark-secondary' : 'bg-white',
    'overflow-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const ContentWrapper = avoidKeyboard ? KeyboardAvoidingView : View;
  const keyboardProps = avoidKeyboard
    ? { behavior: Platform.OS === 'ios' ? ('padding' as const) : undefined }
    : {};

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType === 'slide' ? 'slide' : 'none'}
      onRequestClose={onClose}
      statusBarTranslucent
      testID={testID}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View className={`flex-1 ${positionClasses[position]}`}>
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              opacity: fadeAnim,
            }}
          />
          <TouchableWithoutFeedback>
            <Animated.View
              className={containerClasses}
              style={[
                style,
                animationType === 'fade' && {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <ContentWrapper className="flex-1" {...keyboardProps}>
                {/* Header */}
                {(title || showCloseButton) && (
                  <View className="flex-row items-start justify-between p-4 pb-2">
                    <View className="flex-1 pr-2">
                      {title && (
                        <Text
                          className={`text-lg font-semibold ${
                            isDark ? 'text-foreground-dark' : 'text-foreground'
                          }`}
                        >
                          {title}
                        </Text>
                      )}
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
                    {showCloseButton && (
                      <TouchableOpacity
                        onPress={onClose}
                        className="p-1 -mr-1 -mt-1"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityLabel="Close modal"
                        accessibilityRole="button"
                      >
                        <Ionicons name="close" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Content */}
                {scrollable && !isFullScreen ? (
                  <ScrollView
                    className={`px-4 ${contentClassName}`}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                  >
                    {children}
                    <View className="h-4" />
                  </ScrollView>
                ) : (
                  <View className={`px-4 flex-1 ${contentClassName}`}>{children}</View>
                )}

                {/* Footer */}
                {footer && (
                  <View
                    className={`p-4 pt-2 flex-row items-center justify-end gap-2 border-t ${
                      isDark ? 'border-border-dark' : 'border-border'
                    }`}
                  >
                    {footer}
                  </View>
                )}
              </ContentWrapper>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

// ===========================================
// MODAL CONTEXT (for nested modals)
// ===========================================

interface ModalContextValue {
  openModal: (content: React.ReactNode, props?: Partial<ModalProps>) => void;
  closeModal: () => void;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = React.useState<{
    visible: boolean;
    content: React.ReactNode;
    props: Partial<ModalProps>;
  }>({
    visible: false,
    content: null,
    props: {},
  });

  const openModal = (content: React.ReactNode, props: Partial<ModalProps> = {}) => {
    setModalState({ visible: true, content, props });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Modal visible={modalState.visible} onClose={closeModal} {...modalState.props}>
        {modalState.content}
      </Modal>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * BottomModal - Modal that slides up from bottom
 */
export function BottomModal(props: Omit<ModalProps, 'position'>) {
  return <Modal position="bottom" animationType="slide" {...props} />;
}

/**
 * FullScreenModal - Full screen modal
 */
export function FullScreenModal(props: Omit<ModalProps, 'size'>) {
  return <Modal size="full" {...props} />;
}

/**
 * SheetModal - Bottom sheet style modal
 */
export interface SheetModalProps extends Omit<ModalProps, 'position' | 'size'> {
  snapPoints?: string[];
}

export function SheetModal({ snapPoints, ...props }: SheetModalProps) {
  return (
    <Modal position="bottom" size="xl" animationType="slide" showCloseButton={false} {...props} />
  );
}
