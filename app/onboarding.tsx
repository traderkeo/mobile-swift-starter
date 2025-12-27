import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/components/onboarding';
import { ONBOARDING_SLIDES } from '@/config/onboarding';
import { useOnboarding } from '@/hooks/use-onboarding';

export default function Onboarding() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();

  const handleComplete = async () => {
    await completeOnboarding();
    // After onboarding, go to main app (user is already authenticated)
    router.replace('/(tabs)');
  };

  return (
    <OnboardingScreen
      slides={ONBOARDING_SLIDES}
      onComplete={handleComplete}
      onSkip={handleComplete}
    />
  );
}
