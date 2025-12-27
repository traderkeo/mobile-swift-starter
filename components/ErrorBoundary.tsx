/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child components and displays a fallback UI.
 *
 * @example
 * // Wrap your app or specific sections
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorScreen />}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With error handler
 * <ErrorBoundary onError={(error, info) => reportToService(error, info)}>
 *   <MyComponent />
 * </ErrorBoundary>
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ============================================
// TYPES
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Call error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Custom fallback render function
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }

      // Custom fallback element
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={this.state.errorInfo}
          onReset={this.resetError}
        />
      );
    }

    return children;
  }
}

// ============================================
// DEFAULT ERROR FALLBACK
// ============================================

interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

function DefaultErrorFallback({ error, errorInfo, onReset }: DefaultErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <View className="flex-1 bg-background dark:bg-background-dark items-center justify-center p-6">
      <View className="items-center mb-6">
        <View className="w-20 h-20 rounded-full bg-danger/10 items-center justify-center mb-4">
          <Ionicons name="warning" size={40} color="#ef4444" />
        </View>
        <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark text-center mb-2">
          Something went wrong
        </Text>
        <Text className="text-foreground-muted dark:text-foreground-dark-muted text-center">
          We are sorry, but something unexpected happened.
        </Text>
      </View>

      <TouchableOpacity
        onPress={onReset}
        className="bg-primary py-3 px-6 rounded-xl mb-4"
        activeOpacity={0.8}
      >
        <Text className="text-white font-semibold text-base">Try Again</Text>
      </TouchableOpacity>

      {__DEV__ && (
        <TouchableOpacity
          onPress={() => setShowDetails(!showDetails)}
          className="flex-row items-center py-2"
        >
          <Text className="text-primary dark:text-primary-400 mr-1">
            {showDetails ? 'Hide' : 'Show'} Error Details
          </Text>
          <Ionicons name={showDetails ? 'chevron-up' : 'chevron-down'} size={16} color="#0a7ea4" />
        </TouchableOpacity>
      )}

      {__DEV__ && showDetails && (
        <ScrollView
          className="mt-4 w-full max-h-64 bg-background-secondary dark:bg-background-dark-tertiary rounded-xl p-4"
          showsVerticalScrollIndicator
        >
          <Text className="text-sm font-mono text-danger mb-2">
            {error.name}: {error.message}
          </Text>
          {error.stack && (
            <Text className="text-xs font-mono text-foreground-muted dark:text-foreground-dark-muted mb-4">
              {error.stack}
            </Text>
          )}
          {errorInfo?.componentStack && (
            <>
              <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark mb-1">
                Component Stack:
              </Text>
              <Text className="text-xs font-mono text-foreground-muted dark:text-foreground-dark-muted">
                {errorInfo.componentStack}
              </Text>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ============================================
// HOOK VERSION
// ============================================

interface UseErrorBoundaryReturn {
  error: Error | null;
  resetError: () => void;
  showBoundary: (error: Error) => void;
}

/**
 * Hook for imperatively triggering error boundary
 * Must be used with ErrorBoundary wrapper
 */
export function useErrorBoundary(): UseErrorBoundaryReturn {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const showBoundary = React.useCallback((err: Error) => {
    setError(err);
  }, []);

  // Throw error to trigger nearest ErrorBoundary
  if (error) {
    throw error;
  }

  return { error, resetError, showBoundary };
}

// ============================================
// CONVENIENCE WRAPPERS
// ============================================

/**
 * HOC to wrap component with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithErrorBoundary;
}

/**
 * Minimal error fallback for non-critical sections
 */
export function MinimalErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  return (
    <View className="p-4 bg-danger/10 rounded-xl items-center">
      <Text className="text-danger text-center mb-2">
        Something went wrong loading this section.
      </Text>
      <TouchableOpacity onPress={onReset} className="py-2 px-4 bg-danger/20 rounded-lg">
        <Text className="text-danger font-medium">Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Wrapper for screen-level error boundaries
 */
export function ScreenErrorBoundary({
  children,
  onError,
}: {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}) {
  return (
    <ErrorBoundary
      onError={onError}
      fallback={(error, reset) => (
        <DefaultErrorFallback error={error} errorInfo={null} onReset={reset} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Wrapper for component-level error boundaries (non-critical)
 */
export function ComponentErrorBoundary({
  children,
  onError,
}: {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}) {
  return (
    <ErrorBoundary
      onError={onError}
      fallback={(error, reset) => <MinimalErrorFallback error={error} onReset={reset} />}
    >
      {children}
    </ErrorBoundary>
  );
}
