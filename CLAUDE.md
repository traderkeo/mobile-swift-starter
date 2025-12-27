# CLAUDE.md - AI Agent Technical Reference

Token-optimized guide for AI agents working on this codebase.

## Quick Context

Expo React Native app with local storage + RevenueCat payments.

- Frontend: Expo 54, React 19, TypeScript, NativeWind (Tailwind)
- Storage: AsyncStorage for local data persistence
- Auth: Local user identity (syncs with RevenueCat) + optional biometrics
- Payments: RevenueCat (iOS, Android) - client-side verification
- Widgets: iOS WidgetKit with Lock Screen, Interactive, and Live Activities
- Crash Reporting: Sentry integration
- Networking: API client with retry, caching, offline queue
- i18n: Multi-language support (8 languages)
- iOS Features: ATT, Siri Shortcuts, Spotlight Search, Background Tasks

## Project Structure

```
/                           # Root (Expo frontend)
├── app/                    # Expo Router pages (file-based routing)
│   ├── (auth)/            # Auth screens: login, signup, forgot-password
│   ├── (tabs)/            # Tab screens: index (home), profile, settings
│   └── payment/           # Payment result screen
├── components/            # React Native components
│   ├── payments/          # Paywall, PremiumGate, SubscriptionStatus, etc.
│   ├── ads/               # Ad components (Banner, Interstitial, Rewarded)
│   ├── media/             # ImagePicker, CameraCapture components
│   ├── navigation/        # Custom navigation components (CustomTabBar)
│   ├── ui/                # 40+ reusable UI components
│   └── ErrorBoundary.tsx  # Error handling wrapper
├── scripts/
│   └── generate.js        # Code generation for screens/components/hooks
├── config/                # App configuration
│   ├── env.ts             # Environment variable validation
│   ├── product.ts         # Product/pricing config (RevenueCat entitlements)
│   ├── feature-flags.ts   # Local feature flags & A/B testing
│   ├── onboarding.ts      # Onboarding flow config
│   └── ads.ts             # Ad configuration & frequency capping
├── context/
│   └── AuthContext.tsx    # Local auth state management
├── hooks/                 # Custom React hooks
│   ├── use-revenuecat.ts  # RevenueCat purchases (iOS/Android)
│   ├── use-biometric.ts   # Face ID / Touch ID / Fingerprint
│   ├── use-app-update.ts  # OTA updates via expo-updates
│   ├── use-unified-payments.ts # Unified purchase interface
│   ├── use-onboarding.ts  # Onboarding state
│   ├── use-theme-color.ts # Theme hooks (useTheme, useIsDark, etc.)
│   ├── use-animation.ts   # Animation hooks (useFadeIn, useSlideIn, etc.)
│   ├── use-image-picker.ts # Image picker hook
│   └── use-camera.ts      # Camera hook
├── lib/
│   ├── storage.ts         # AsyncStorage typed wrapper
│   ├── auth.ts            # Local authentication service
│   ├── analytics.ts       # Local analytics service
│   ├── security.ts        # Password validation, rate limiting
│   ├── validations.ts     # Zod schemas for forms
│   ├── share.ts           # Native sharing utilities
│   ├── performance.ts     # Memoization, image optimization
│   ├── debug.ts           # Dev-only debugging utilities
│   ├── sentry.ts          # Crash reporting (Sentry)
│   ├── api.ts             # Network layer with retry/caching
│   ├── network.ts         # Network state & offline support
│   ├── i18n.ts            # Internationalization
│   ├── store-review.ts    # App Store review prompts
│   ├── tracking-transparency.ts # iOS ATT
│   ├── deep-linking.ts    # Deep link handlers
│   ├── background-tasks.ts # Background fetch
│   ├── spotlight.ts       # iOS Spotlight indexing
│   ├── siri-shortcuts.ts  # Siri Shortcuts
│   ├── performance-monitor.ts # Performance tracking
│   ├── animations.ts      # Animation presets and utilities
│   ├── ads.ts             # AdMob integration
│   └── ads-attribution.ts # Apple Search Ads attribution
├── constants/
│   ├── theme.ts           # Centralized design tokens
│   └── component-styles.ts # Shared component configurations
├── services/
│   └── payments.ts        # Payment service (RevenueCat wrapper)
├── targets/
│   └── widget/            # iOS WidgetKit extension
│       └── index.swift    # Home, Lock Screen, Interactive & Live Activities
├── .maestro/              # E2E tests (Maestro)
├── .github/workflows/     # CI/CD (GitHub Actions)
└── types/                 # TypeScript types
```

## Key Files to Edit

| Task                   | File(s)                                                                     |
| ---------------------- | --------------------------------------------------------------------------- |
| Add new screen         | `app/(tabs)/newscreen.tsx` or `app/newscreen.tsx`                           |
| Add UI component       | `components/ui/`                                                            |
| Add custom hook        | `hooks/use-*.ts`                                                            |
| Change product/pricing | RevenueCat Dashboard + `config/product.ts`                                  |
| Add env variable       | `config/env.ts` + `.env`                                                    |
| Auth logic             | `context/AuthContext.tsx`, `lib/auth.ts`                                    |
| Payment flow           | `hooks/use-revenuecat.ts`, `services/payments.ts`                           |
| Feature flags          | `config/feature-flags.ts`                                                   |
| Biometric auth         | `hooks/use-biometric.ts`                                                    |
| iOS Widgets            | `targets/widget/index.swift`                                                |
| E2E tests              | `.maestro/*.yaml`                                                           |
| Generate code          | `pnpm generate screen/component/hook Name`                                  |
| Security utils         | `lib/security.ts`                                                           |
| Performance utils      | `lib/performance.ts`                                                        |
| Debug utilities        | `lib/debug.ts`                                                              |
| Error boundaries       | `components/ErrorBoundary.tsx`                                              |
| Crash reporting        | `lib/sentry.ts`                                                             |
| Network/API layer      | `lib/api.ts`, `lib/network.ts`                                              |
| Localization           | `lib/i18n.ts`                                                               |
| App Store review       | `lib/store-review.ts`                                                       |
| Deep linking           | `lib/deep-linking.ts`                                                       |
| Background tasks       | `lib/background-tasks.ts`                                                   |
| Siri Shortcuts         | `lib/siri-shortcuts.ts`                                                     |
| Spotlight Search       | `lib/spotlight.ts`                                                          |
| Performance monitoring | `lib/performance-monitor.ts`                                                |
| Advertising (AdMob)    | `lib/ads.ts`, `config/ads.ts`, `components/ads/`                            |
| Apple Search Ads       | `lib/ads-attribution.ts`                                                    |
| Media (photos/camera)  | `components/media/`, `hooks/use-image-picker.ts`                            |
| Theme utilities        | `hooks/use-theme-color.ts`, `constants/theme.ts`                            |
| Form validation        | `lib/validations.ts`                                                        |
| Sharing                | `lib/share.ts`                                                              |
| Component styles       | `constants/component-styles.ts`                                             |
| Custom tab bar         | `components/navigation/CustomTabBar.tsx`                                    |
| Animations             | `lib/animations.ts`, `hooks/use-animation.ts`, `components/ui/Animated.tsx` |

## Payments (RevenueCat)

RevenueCat handles all in-app purchases with client-side verification:

- iOS: App Store (StoreKit)
- Android: Google Play Billing

### RevenueCat Setup

1. Create account at https://app.revenuecat.com
2. Add your App Store Connect / Play Console apps
3. Create products in stores, add to RevenueCat
4. Create Offering called "default" with packages
5. Create Entitlement called "premium"
6. Add API keys to `.env`:
   - `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY`
   - `EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY`

### Usage Example

```tsx
import { useRevenueCat } from '@/hooks/use-revenuecat';

function PaywallScreen() {
  const { products, purchasePackage, isPremium, isLoading } = useRevenueCat();

  if (isPremium) return <Text>You have premium!</Text>;

  return (
    <View>
      {products.map((product) => (
        <Button
          key={product.identifier}
          onPress={() => purchasePackage(product.package)}
          disabled={isLoading}
        >
          {product.title} - {product.priceString}
        </Button>
      ))}
    </View>
  );
}
```

## Feature Flags

Local feature flags for A/B testing without external services:

```tsx
import { useFeatureFlags, FLAGS } from '@/config/feature-flags';

function MyComponent() {
  const { isEnabled, variant } = useFeatureFlags();

  // Check feature flag
  if (isEnabled('NEW_PAYWALL')) {
    return <NewPaywall />;
  }

  // Get A/B test variant
  const paywallVariant = variant('PAYWALL_VARIANT'); // 'A' | 'B'
}
```

Add new flags in `config/feature-flags.ts`:

```typescript
export const FLAGS = {
  NEW_ONBOARDING: false,
  NEW_PAYWALL: false,
  BIOMETRIC_LOGIN: true,
};
```

## Local Auth (User Identity)

The auth system creates a **local user identity** that syncs with RevenueCat:

- **Creates unique user ID** - Tied to RevenueCat for purchase tracking
- **Stores credentials locally** - Email/password hash in SecureStore
- **Enables purchase restoration** - User can restore purchases on new device
- **No server required** - Everything stored on-device

This is NOT traditional authentication - there's no server verifying credentials. It's a local identity system for apps that don't need a backend.

**For server-side auth**: Swap `lib/auth.ts` with your preferred provider (Supabase, Firebase, Clerk, etc.) and update `AuthContext.tsx`.

## Biometric Authentication

Face ID, Touch ID, and fingerprint support:

```tsx
import { useBiometric } from '@/hooks/use-biometric';

function LoginScreen() {
  const { isAvailable, biometricLabel, authenticate, isEnabled, setEnabled } = useBiometric();

  // Check if biometrics available
  if (isAvailable) {
    // Show "Login with Face ID" button
  }

  // Authenticate user
  const success = await authenticate('Unlock your account');

  // Enable/disable biometric login in settings
  await setEnabled(true);
}
```

## iOS Widgets

The app includes full WidgetKit support:

- **Home Screen Widgets**: Small, Medium, Large
- **Lock Screen Widgets**: Circular, Rectangular, Inline (iOS 16+)
- **Interactive Widgets**: With App Intents buttons (iOS 17+)
- **Live Activities**: Dynamic Island & Lock Screen (iOS 16.1+)

Edit widgets in `targets/widget/index.swift`.

## Environment Variables

**Frontend (.env)**

```bash
# Required for payments
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY  # RevenueCat Apple API key
EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY # RevenueCat Google API key

# Recommended
EXPO_PUBLIC_SENTRY_DSN                # Sentry crash reporting

# Optional
EXPO_PUBLIC_API_URL                   # Backend API URL (if any)
EXPO_PUBLIC_APP_STORE_ID              # Apple App Store ID
EXPO_PUBLIC_PLAY_STORE_ID             # Google Play package name
EXPO_PUBLIC_UNIVERSAL_LINKS_DOMAIN    # Domain for deep links
```

## Commands

```bash
# Development
pnpm install                  # Install deps
pnpm start                    # Start Expo
pnpm ios / pnpm android       # Run on simulator/emulator

# Code Generation
pnpm generate screen MyScreen      # Create new screen
pnpm generate tab Dashboard        # Create new tab screen
pnpm generate component UserCard   # Create new component
pnpm generate hook useData         # Create custom hook

# Testing & Linting
pnpm test                     # Run unit tests (Jest)
pnpm lint                     # ESLint
pnpm format                   # Prettier
pnpm e2e                      # Run E2E tests (Maestro)

# Build & Deploy
pnpm build:ios                # Build iOS (EAS)
pnpm build:android            # Build Android (EAS)
pnpm build:all                # Build all platforms
pnpm update                   # Publish OTA update (production)
pnpm update:preview           # Publish OTA update (preview)
```

## Build Profiles (eas.json)

- **development**: Dev client with simulator support
- **preview**: Internal testing builds
- **production**: App Store / Play Store builds with auto-increment

## CI/CD (GitHub Actions)

- **Test & Lint**: Runs on every PR and push
- **EAS Build**: Builds on push to main (production) and PRs (preview)
- **OTA Update**: Publishes updates after successful builds

Required secrets:

- `EXPO_TOKEN`: Get from expo.dev

## E2E Testing (Maestro)

Tests in `.maestro/` directory:

```bash
# Run all tests
pnpm e2e

# Run specific flow
pnpm e2e:auth
pnpm e2e:payments
```

## Analytics Events

Payment events are automatically tracked:

- `checkout_started` - User initiates purchase
- `purchase_completed` - Successful purchase
- `purchase_failed` - Failed purchase
- `subscription_restored` - Restore purchases

Add custom events:

```typescript
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

trackEvent(AnalyticsEvents.FEATURE_USED, { feature: 'ai_chat' });
```

## Common Modifications

**Add new screen:**

1. Create `app/(tabs)/screen.tsx` (tabbed) or `app/screen.tsx`
2. Export default component
3. Expo Router auto-registers route

**Add feature flag:**

1. Add flag to `config/feature-flags.ts` FLAGS object
2. Use `isEnabled('FLAG_NAME')` in components

**Add E2E test:**

1. Create `.maestro/category/test-name.yaml`
2. Run `pnpm e2e` to test

**Customize widgets:**

1. Edit `targets/widget/index.swift`
2. Rebuild with `pnpm build:ios`

**Check premium status:**

```tsx
const { isPremium } = useRevenueCat();
if (isPremium) {
  // Show premium feature
}
```

## Security Features

**Password Validation:**

```typescript
import { validatePassword, getPasswordStrengthLabel } from '@/lib/security';

const result = validatePassword(password);
if (!result.isValid) {
  console.log(result.errors); // Validation errors
}
console.log(getPasswordStrengthLabel(result.score)); // "Weak" | "Fair" | "Strong"
```

**Rate Limiting (Brute Force Protection):**

Login attempts are automatically rate-limited (5 attempts per 15 minutes, 30 min lockout).

## UI Components

40+ reusable UI components with NativeWind styling:

| Category   | Components                                                                     |
| ---------- | ------------------------------------------------------------------------------ |
| Core       | Button, Card, Text, Input, Badge, Avatar, PressableScale                       |
| Forms      | FormField, Checkbox, Radio, Switch, Select, Slider                             |
| Layout     | Screen, Modal, BottomSheet, Tabs, Accordion                                    |
| Feedback   | Toast, Alert, Loading, Progress, EmptyState                                    |
| Display    | Timeline, DataTable, Rating, Pagination, Tooltip                               |
| Navigation | Stepper, FAB, Carousel, ActionSheet, Chip                                      |
| Skeleton   | Skeleton, SkeletonText, SkeletonCard, PaywallSkeleton                          |
| Animation  | FadeIn, SlideIn, ScaleIn, Stagger, AnimatedPresence, Pulse, Shimmer, Shakeable |

```tsx
import { Modal, Tabs, Rating, FormField, Timeline, PressableScale } from '@/components/ui';
import { Skeleton, PaywallSkeleton } from '@/components/ui';
```

### PressableScale

A reusable wrapper that adds press scale animation to any component:

```tsx
import { PressableScale } from '@/components/ui';

<PressableScale onPress={handlePress} scale={0.96}>
  <Card>Animated on press!</Card>
</PressableScale>;
```

### Custom Tab Bar

The app uses a custom animated tab bar with optional blur effect:

```tsx
// Enabled by default in app/(tabs)/_layout.tsx
import { CustomTabBar } from '@/components/navigation';

<Tabs tabBar={(props) => <CustomTabBar {...props} />}>{/* Tab screens */}</Tabs>;
```

Features:

- Glassmorphism blur effect (install `expo-blur` for full effect)
- Press scale animations with haptic feedback
- Animated active indicator
- Dark/light mode support

To enable blur: `npx expo install expo-blur`

## Animations

Comprehensive animation system with presets, hooks, and ready-to-use components. All animations use native driver for 60fps performance.

### Animation Components

Wrap any content with animation components for instant effects:

```tsx
import {
  FadeIn,
  SlideIn,
  ScaleIn,
  ZoomIn,
  Stagger,
  AnimatedPresence,
  Pulse,
  Shimmer,
  Shakeable,
  Bouncy,
} from '@/components/ui';

// Fade in on mount
<FadeIn delay={200}>
  <Text>Hello World</Text>
</FadeIn>

// Slide from direction
<SlideIn direction="left" distance={50}>
  <Card>Content</Card>
</SlideIn>

// Scale with bounce
<ScaleIn preset="bouncy" startScale={0.8}>
  <Modal>...</Modal>
</ScaleIn>

// Staggered list items
<Stagger staggerDelay={100}>
  {items.map((item) => (
    <ListItem key={item.id} {...item} />
  ))}
</Stagger>

// Animate visibility changes
<AnimatedPresence visible={isVisible} type="scale">
  <Tooltip>...</Tooltip>
</AnimatedPresence>

// Attention effects
<Pulse autoPlay><Badge>New</Badge></Pulse>
<Shimmer><SkeletonCard /></Shimmer>
```

### Imperative Animations

Trigger animations programmatically via refs:

```tsx
import { Shakeable, Bouncy, ShakeRef, BounceRef } from '@/components/ui';

const shakeRef = useRef<ShakeRef>(null);
const bounceRef = useRef<BounceRef>(null);

// Shake on validation error
<Shakeable shakeRef={shakeRef} intensity={10}>
  <Input error={hasError} />
</Shakeable>;

// Trigger shake
shakeRef.current?.shake();

// Bounce on success
<Bouncy bounceRef={bounceRef}>
  <SuccessIcon />
</Bouncy>;

bounceRef.current?.bounce();
```

### Animation Hooks

For custom animations, use the hooks directly:

```tsx
import {
  useFadeIn,
  useSlideIn,
  useScaleIn,
  usePressAnimation,
  useShake,
  usePulse,
  useRotation,
  useStaggeredAnimation,
  useLayoutAnimation,
} from '@/hooks/use-animation';

// Entrance animations
const { animatedStyle, animate, reset } = useFadeIn({ delay: 200 });
const { animatedStyle } = useSlideIn('up', { distance: 50, autoPlay: true });
const { animatedStyle } = useScaleIn({ startScale: 0.8, preset: 'bouncy' });

// Press feedback (for custom touchables)
const { animatedStyle, onPressIn, onPressOut } = usePressAnimation(0.96);

// Effects
const { shake, animatedStyle } = useShake(10);
const { start, stop, animatedStyle } = usePulse({ autoPlay: true });
const { rotate, animatedStyle } = useRotation({ loop: true, duration: 1000 });

// Layout animations (for list changes)
const layout = useLayoutAnimation();
layout.spring(); // Before state update
setItems([...items, newItem]);
```

### Animation Presets

Use presets for consistent motion:

```typescript
import { SpringPresets, TimingPresets, withSpring, withTiming } from '@/lib/animations';

// Spring presets: gentle, default, bouncy, stiff, slow, press, release, modal, snappy, wobbly
withSpring(animatedValue, 1, 'bouncy').start();

// Timing presets: instant, quick, fast, default, normal, slow, fadeIn, fadeOut, slideIn, slideOut
withTiming(animatedValue, 1, 'slideIn').start();

// Direct preset usage
Animated.spring(value, { toValue: 1, ...SpringPresets.bouncy });
```

### Animation Utilities

Helper functions for complex animations:

```typescript
import {
  sequence,
  parallel,
  stagger,
  loop,
  delay,
  createShakeAnimation,
  createPulseAnimation,
  createBounceAnimation,
  animateLayout,
} from '@/lib/animations';

// Chain animations
sequence([fadeIn, slideUp, scaleIn]).start();

// Run in parallel
parallel([fadeIn, scaleIn]).start();

// Stagger list animations
stagger(50, itemAnimations).start();

// Loop animation
loop(pulseAnimation, -1).start(); // -1 = infinite

// Layout animation before state update
animateLayout('spring'); // or 'fade', 'scale', 'quick'
setData(newData);
```

### Interpolation Helpers

Transform animated values:

```typescript
import {
  interpolateOpacity,
  interpolateScale,
  interpolateRotation,
  interpolateTranslateY,
  interpolateColor,
} from '@/lib/animations';

const opacity = interpolateOpacity(progress, [0, 1]); // 0 -> 1
const scale = interpolateScale(progress, [0, 1], [0.8, 1]); // 0.8 -> 1
const rotation = interpolateRotation(progress, [0, 1], ['0deg', '360deg']);
const translateY = interpolateTranslateY(progress, [0, 1], [50, 0]); // 50px -> 0
```

| File                         | Purpose                                   |
| ---------------------------- | ----------------------------------------- |
| `lib/animations.ts`          | Presets, utilities, interpolation helpers |
| `hooks/use-animation.ts`     | Reusable animation hooks                  |
| `components/ui/Animated.tsx` | Ready-to-use animated components          |

## Error Handling

```tsx
import { ErrorBoundary, ScreenErrorBoundary } from '@/components/ErrorBoundary';

// Wrap screens with error boundary
<ScreenErrorBoundary>
  <MyScreen />
</ScreenErrorBoundary>;
```

## Performance Utilities

```typescript
import {
  useDebounce,
  useDebouncedCallback,
  useThrottledCallback,
  memoize,
  measureTime,
} from '@/lib/performance';

// Debounce value
const debouncedSearch = useDebounce(searchTerm, 300);

// Debounce callback
const handleSearch = useDebouncedCallback((query) => search(query), 300);

// Measure execution time (dev only)
measureTime(() => expensiveOperation(), 'My Operation');
```

## Debug Utilities (Dev Only)

```typescript
import { logger, logStateChange, assert } from '@/lib/debug';

// Structured logging with tags
logger.debug('Auth', 'User logged in', { userId });
logger.warn('Network', 'Slow response', { duration: 2500 });

// Assertions (dev only, no-op in production)
assert(user !== null, 'User should be defined');
```

## Crash Reporting (Sentry)

```typescript
import { captureException, captureMessage, setUser } from '@/lib/sentry';

// Capture errors
try {
  riskyOperation();
} catch (error) {
  captureException(error);
}

// Set user context after login
setUser({ id: 'user-123', email: 'user@example.com' });
```

## Network Layer

API client with automatic retry, caching, and offline queue:

```typescript
import { api, createApiClient } from '@/lib/api';

// Simple requests
const data = await api.get('/users');
const result = await api.post('/users', { name: 'John' });

// With caching (60 second TTL)
const products = await api.get('/products', { cache: { ttl: 60000 } });

// Queue for offline
await api.post('/events', eventData, { queueIfOffline: true });
```

## Offline Support

```typescript
import { useNetwork, useIsOnline } from '@/lib/network';

function MyComponent() {
  const { isConnected, type, isWifi } = useNetwork();
  const isOnline = useIsOnline();

  if (!isOnline) {
    return <OfflineBanner />;
  }
}
```

## Localization (i18n)

8 languages supported: English, Spanish, French, German, Japanese, Chinese, Korean, Portuguese

```typescript
import { t, useTranslation, setLocale } from '@/lib/i18n';

// In components
function MyComponent() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <Text>{t('common.hello')}</Text>
    <Text>{t('common.welcome', { name: 'John' })}</Text>
  );
}

// Change language
await setLocale('es');
```

## App Store Review

Smart review prompting with engagement tracking:

```typescript
import { trackPositiveAction, maybeRequestReview, openStoreListing } from '@/lib/store-review';

// Track positive actions
trackPositiveAction('completed_purchase');
trackPositiveAction('shared_content');

// Request review (only shows if conditions met)
await maybeRequestReview();

// For "Rate Us" button in settings
await openStoreListing();
```

## App Tracking Transparency (iOS)

```typescript
import { useTrackingTransparency } from '@/lib/tracking-transparency';

function App() {
  const { status, isAllowed, requestPermission, hasPrompted } = useTrackingTransparency();

  // Show pre-prompt, then request permission
  if (!hasPrompted) {
    return <TrackingPermissionPrompt onComplete={handleComplete} />;
  }
}
```

## Background Tasks

```typescript
import { registerBackgroundTask, BackgroundTaskName } from '@/lib/background-tasks';

// Register a task
await registerBackgroundTask(BackgroundTaskName.SYNC_DATA, async () => {
  await syncUserData();
  return true; // Success
});
```

## Siri Shortcuts

```typescript
import { donateShortcut, SiriShortcuts } from '@/lib/siri-shortcuts';

// Donate when user performs action
await donateShortcut(SiriShortcuts.OPEN_PREMIUM);

// With custom data
await donateShortcut(SiriShortcuts.VIEW_PRODUCT, {
  productId: '123',
  productName: 'Premium Plan',
});
```

## Spotlight Search

```typescript
import { indexItem, searchItems } from '@/lib/spotlight';

// Index content for Spotlight
await indexItem({
  id: 'product-123',
  title: 'Premium Subscription',
  description: 'Unlock all features',
  keywords: ['premium', 'subscription'],
  deepLink: 'yourapp://product/123',
});
```

## Performance Monitoring

```typescript
import { PerformanceMonitor, useScreenPerformance } from '@/lib/performance-monitor';

// Track screen render time
function MyScreen() {
  useScreenPerformance('MyScreen');
  return <Content />;
}

// Measure async operations
await PerformanceMonitor.measureAsync('api_call', async () => {
  return await fetchData();
});
```

## Advertising (AdMob)

Full AdMob integration for ad-based monetization:

```typescript
import { useInterstitialAd, useRewardedAd, BannerAd } from '@/lib/ads';
import { BannerAdContainer, RewardedAdButton, AdFreeGate } from '@/components/ads';

// Banner ad at screen bottom
<BannerAdContainer position="bottom" />

// Interstitial ad hook
const { showAd, isLoaded } = useInterstitialAd();
await showAd();

// Rewarded ad with callback
const { showAd, isLoaded, reward } = useRewardedAd();
const earned = await showAd();
if (earned) {
  addCoins(earned.amount);
}

// Ready-to-use rewarded button
<RewardedAdButton
  onReward={(reward) => addCoins(reward.amount)}
  rewardText="Watch ad for 100 coins"
/>

// Hide ads for premium users
<AdFreeGate>
  <BannerAd />
</AdFreeGate>
```

### AdMob Setup

1. Create account at https://admob.google.com
2. Add your iOS and Android apps
3. Create ad units (Banner, Interstitial, Rewarded)
4. Update `app.json` with your App IDs:
   ```json
   [
     "react-native-google-mobile-ads",
     {
       "androidAppId": "ca-app-pub-xxx~yyy",
       "iosAppId": "ca-app-pub-xxx~yyy"
     }
   ]
   ```
5. Add ad unit IDs to `.env`

### Ad Configuration

Configure frequency capping and placements in `config/ads.ts`:

```typescript
// Frequency limits
AD_FREQUENCY: {
  INTERSTITIAL_COOLDOWN: 60000,    // 1 min between interstitials
  MAX_INTERSTITIALS_PER_SESSION: 5,
  REWARDED_COOLDOWN: 30000,        // 30s between rewarded
}

// Check if ads should show
import { shouldShowAds } from '@/config/ads';
if (shouldShowAds(isPremium)) {
  // Show ad
}
```

## Apple Search Ads Attribution

Track user acquisition from Apple Search Ads:

```typescript
import { initializeAttribution, trackConversion } from '@/lib/ads-attribution';

// Initialize on app start
await initializeAttribution();

// Track conversion after purchase
await trackConversion('premium_subscription', 9.99);
```

## Media Components (Photos & Camera)

Ready-to-use components for image picking and camera capture.

**Installation:**

```bash
expo install expo-image-picker expo-camera
```

### Image Picker

```tsx
import { ImagePicker } from '@/components/media';

// Basic usage
<ImagePicker onImageSelected={(image) => console.log(image.uri)} />

// With editing and preview
<ImagePicker
  showPreview
  allowsEditing
  aspect={[1, 1]}
  onImageSelected={handleImage}
/>

// Multiple images
<ImagePicker
  multiple
  selectionLimit={5}
  onImagesSelected={(images) => console.log(images)}
/>
```

### Camera Capture

```tsx
import { CameraCapture } from '@/components/media';

// Basic usage
<CameraCapture onPhotoTaken={(photo) => console.log(photo.uri)} />

// Fullscreen with preview
<CameraCapture
  fullscreen
  showPreview
  onPhotoTaken={handlePhoto}
  onClose={closeCamera}
/>
```

### Using Hooks Directly

```tsx
import { useImagePicker } from '@/hooks/use-image-picker';
import { useCamera } from '@/hooks/use-camera';

// Image picker hook
const { pickImage, takePhoto, image, isLoading } = useImagePicker();
const photo = await pickImage({ quality: 0.8 });

// Camera hook
const { cameraRef, takePicture, toggleFacing, flash } = useCamera();
```

## Theme Utilities

Centralized theming with NativeWind/Tailwind:

```tsx
import { useTheme, useIsDark, useSemanticColor } from '@/hooks/use-theme-color';

function MyComponent() {
  // Get full theme context
  const { isDark, colors, semantic } = useTheme();

  // Simple dark mode check (reduces boilerplate)
  const isDark = useIsDark();

  // Get semantic colors
  const primaryColor = useSemanticColor('primary');
  const dangerLight = useSemanticColor('danger', 'light');
}
```

**Customize theme:** Edit `tailwind.config.js` to change colors, spacing, etc.

## Form Validation (Zod)

Comprehensive validation schemas for all form types:

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  loginSchema,
  signupSchema,
  profileSchema,
  creditCardSchema,
  feedbackSchema,
  validateForm,
  validateField,
  formatPhoneNumber,
  type LoginFormData,
} from '@/lib/validations';

// With react-hook-form
const { control, handleSubmit } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});

// Manual validation
const result = validateForm(loginSchema, formData);
if (!result.success) {
  console.log(result.errors); // { email: 'Invalid email', password: '...' }
}

// Single field validation
const emailResult = validateField(emailSchema, 'test@example.com');
```

**Available schemas:** `emailSchema`, `passwordSchema`, `strongPasswordSchema`, `phoneSchema`, `usPhoneSchema`, `usernameSchema`, `urlSchema`, `creditCardSchema`, `billingAddressSchema`, `loginSchema`, `signupSchema`, `profileSchema`, `changePasswordSchema`, `feedbackSchema`, `reviewSchema`

## Sharing

Native share functionality for content, referrals, and files:

```tsx
import {
  shareText,
  shareUrl,
  shareApp,
  shareImage,
  shareDeepLink,
  shareWithReferral,
} from '@/lib/share';

// Share text
await shareText('Check out this app!');

// Share URL with message
await shareUrl('https://example.com', 'Found this interesting article');

// Share app with referral code
await shareApp({ referralCode: 'ABC123', campaign: 'summer2024' });

// Share image
await shareImage(imageUri, 'Check out this photo');

// Share deep link to specific screen
await shareDeepLink('/product/123', { ref: 'share' }, 'Check this product');

// Track referral shares
const { shared, referralCode } = await shareWithReferral(userId, 'Join me on this app!');
```

**Installation:** `expo install expo-sharing expo-file-system`

## iOS Privacy Manifest

Privacy manifest is configured in `app.json` under `ios.privacyManifests`. This is required for App Store submission (iOS 17+) and declares:

- API usage reasons (UserDefaults, File Timestamps, etc.)
- Data collection practices
- Tracking domains
