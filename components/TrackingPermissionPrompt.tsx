/**
 * App Tracking Transparency Permission Prompt
 *
 * A pre-prompt screen that explains why tracking permission is requested
 * before showing the system ATT dialog. This improves opt-in rates.
 *
 * @example
 * ```tsx
 * import { TrackingPermissionPrompt } from '@/components/TrackingPermissionPrompt';
 *
 * function App() {
 *   const [showPrompt, setShowPrompt] = useState(true);
 *
 *   if (showPrompt) {
 *     return (
 *       <TrackingPermissionPrompt
 *         onComplete={() => setShowPrompt(false)}
 *       />
 *     );
 *   }
 *
 *   return <MainApp />;
 * }
 * ```
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import {
  requestTrackingPermission,
  hasPromptedForTracking,
  type TrackingStatus,
} from '@/lib/tracking-transparency';

interface TrackingPermissionPromptProps {
  onComplete: (status: TrackingStatus) => void;
  title?: string;
  description?: string;
  benefits?: string[];
  allowSkip?: boolean;
}

export function TrackingPermissionPrompt({
  onComplete,
  title = 'Help Us Improve Your Experience',
  description = "We'd like to use data to personalize your experience and show you relevant content.",
  benefits = [
    'Personalized recommendations',
    'Relevant content and offers',
    'Better app experience',
  ],
  allowSkip = true,
}: TrackingPermissionPromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isIOS = Platform.OS === 'ios';

  // Handle non-iOS platforms
  React.useEffect(() => {
    if (!isIOS) {
      onComplete('unavailable');
    }
  }, [isIOS, onComplete]);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const status = await requestTrackingPermission();
      onComplete(status);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete('denied');
  };

  // Don't render on non-iOS
  if (!isIOS) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="analytics" size={64} color="#0a7ea4" />
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Description */}
        <Text style={styles.description}>{description}</Text>

        {/* Benefits List */}
        <View style={styles.benefitsList}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={16} color="#6b7280" />
          <Text style={styles.privacyText}>
            Your data is never sold. You can change this in Settings anytime.
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Button onPress={handleContinue} loading={isLoading} style={styles.continueButton}>
          Continue
        </Button>

        {allowSkip && (
          <Button onPress={handleSkip} variant="ghost" style={styles.skipButton}>
            Not Now
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

/**
 * Hook to manage tracking permission prompt visibility
 */
export function useTrackingPermissionPrompt() {
  const [shouldShow, setShouldShow] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    async function check() {
      if (Platform.OS !== 'ios') {
        setIsChecking(false);
        return;
      }

      const hasPrompted = await hasPromptedForTracking();
      setShouldShow(!hasPrompted);
      setIsChecking(false);
    }
    check();
  }, []);

  const dismiss = React.useCallback(() => {
    setShouldShow(false);
  }, []);

  return {
    shouldShow,
    isChecking,
    dismiss,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsList: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginTop: 'auto',
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  buttons: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  continueButton: {
    width: '100%',
  },
  skipButton: {
    width: '100%',
  },
});

export default TrackingPermissionPrompt;
