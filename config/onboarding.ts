import type { OnboardingSlide } from '@/components/onboarding';

/**
 * Default onboarding slides
 * Customize these for your app
 */
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'rocket-outline',
    title: 'Welcome to Your App',
    description: 'Get started quickly with our powerful features designed to help you succeed.',
  },
  {
    id: '2',
    icon: 'shield-checkmark-outline',
    title: 'Secure & Reliable',
    description:
      'Your data is protected with enterprise-grade security. We take your privacy seriously.',
  },
  {
    id: '3',
    icon: 'card-outline',
    title: 'Easy Payments',
    description:
      'Subscribe and manage your payments effortlessly with our integrated payment system.',
  },
];
