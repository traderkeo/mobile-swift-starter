# Expo + RevenueCat Starter

A production-ready React Native starter kit for building mobile apps with in-app purchases and ads. No backend required - everything runs on-device with RevenueCat handling payments.

## What's Included

### Core Features

- **Expo SDK 54** + React 19 + TypeScript
- **RevenueCat** - Subscriptions & one-time purchases (iOS/Android)
- **Apple Ads** - Search Ads attribution + AdMob integration
- **Local Auth** - User identity with SecureStore (syncs with RevenueCat)
- **35+ UI Components** - NativeWind (Tailwind) styled, dark mode ready
- **iOS Widgets** - Home screen, Lock screen, Interactive, Live Activities

### Production Features

- **Crash Reporting** - Sentry integration with user context
- **Network Layer** - API client with retry, caching, offline queue
- **Offline Support** - Network detection, offline action queue
- **i18n** - 8 languages (EN, ES, FR, DE, JA, ZH, KO, PT)
- **App Store Review** - Smart review prompting
- **Privacy Manifest** - iOS 17+ App Store compliance

### iOS Features

- **App Tracking Transparency** - ATT compliance with pre-prompt
- **Siri Shortcuts** - Voice command integration
- **Spotlight Search** - Index content for iOS search
- **Background Tasks** - Background fetch support

### DevOps

- **E2E Testing** - Maestro test flows
- **CI/CD** - GitHub Actions + EAS Build
- **OTA Updates** - expo-updates configured
- **Code Generation** - Scaffold screens, components, hooks

## Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Add your API keys (see Environment Variables below)

# Run the app
pnpm start
```

## Monetization Options

This starter supports two monetization strategies:

### 1. Subscriptions (RevenueCat)

Cross-platform subscriptions and one-time purchases with client-side verification.

```tsx
import { useRevenueCat } from '@/hooks/use-revenuecat';

function PaywallScreen() {
  const { products, purchasePackage, isPremium } = useRevenueCat();

  if (isPremium) return <PremiumContent />;

  return (
    <View>
      {products.map((product) => (
        <Button key={product.identifier} onPress={() => purchasePackage(product.package)}>
          {product.title} - {product.priceString}
        </Button>
      ))}
    </View>
  );
}
```

**Pre-built components:**

- `<Paywall />` - Full paywall with product selection
- `<PremiumGate>` - Wrap premium-only content
- `<SubscriptionStatus />` - Display current plan
- `<RestorePurchases />` - Restore button

### 2. Ad-Based Revenue (Apple Ads + AdMob)

For free apps monetized through advertising:

```tsx
import { BannerAd, useInterstitialAd, useRewardedAd } from '@/lib/ads';

function MyScreen() {
  const { showInterstitial, isLoaded } = useInterstitialAd();
  const { showRewarded, earnedReward } = useRewardedAd();

  return (
    <View>
      {/* Banner ad at bottom */}
      <BannerAd size="banner" position="bottom" />

      {/* Show interstitial between levels */}
      <Button onPress={showInterstitial} disabled={!isLoaded}>
        Next Level
      </Button>

      {/* Rewarded ads for in-app currency */}
      <Button onPress={showRewarded}>Watch Ad for 100 Coins</Button>
    </View>
  );
}
```

**Features:**

- Apple Search Ads attribution tracking
- AdMob banners, interstitials, and rewarded ads
- Frequency capping (configurable cooldowns)
- Premium users skip ads automatically
- Test ad IDs for development

### 3. Hybrid Model

Combine ads + subscriptions: free users see ads, premium users don't.

```tsx
import { useAds } from '@/lib/ads';
import { useRevenueCat } from '@/hooks/use-revenuecat';

function MyScreen() {
  const { isPremium } = useRevenueCat();
  const { BannerAd } = useAds();

  return (
    <View>
      <Content />
      {!isPremium && <BannerAd />}
    </View>
  );
}
```

## Features

### Local Auth (User Identity)

Creates a local user identity that syncs with RevenueCat for purchase tracking. No server required.

```tsx
import { useAuth } from '@/context/AuthContext';

function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, isLoading } = useAuth();

  // Sign up creates a unique user ID synced with RevenueCat
  await signUpWithEmail(email, password, fullName);
}
```

**Features:**

- Password validation with strength scoring
- Rate limiting (brute force protection)
- Session auto-refresh on app resume
- Biometric unlock (Face ID / Touch ID / Fingerprint)

**For server-side auth:** Swap `lib/auth.ts` with Supabase, Firebase, Clerk, etc.

### Crash Reporting (Sentry)

```typescript
import { captureException, setUser } from '@/lib/sentry';

try {
  riskyOperation();
} catch (error) {
  captureException(error);
}

// Set user context after login
setUser({ id: 'user-123', email: 'user@example.com' });
```

### Network Layer

API client with automatic retry, caching, and offline support:

```typescript
import { api } from '@/lib/api';

// Simple requests
const data = await api.get('/users');

// With caching (60 second TTL)
const products = await api.get('/products', { cache: { ttl: 60000 } });

// Queue for offline
await api.post('/events', eventData, { queueIfOffline: true });
```

### Offline Support

```typescript
import { useNetwork, useIsOnline } from '@/lib/network';

function MyComponent() {
  const { isConnected, isWifi } = useNetwork();
  const isOnline = useIsOnline();

  if (!isOnline) {
    return <OfflineBanner />;
  }
}
```

### Localization (i18n)

8 languages supported out of the box:

```typescript
import { t, useTranslation, setLocale } from '@/lib/i18n';

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

### App Store Review

Smart review prompting with engagement tracking:

```typescript
import { trackPositiveAction, maybeRequestReview } from '@/lib/store-review';

// Track positive actions
trackPositiveAction('completed_purchase');

// Request review (only shows if conditions met)
await maybeRequestReview();
```

### App Tracking Transparency (iOS)

```typescript
import { useTrackingTransparency } from '@/lib/tracking-transparency';

function App() {
  const { status, requestPermission, hasPrompted } = useTrackingTransparency();

  if (!hasPrompted) {
    return <TrackingPermissionPrompt onComplete={handleComplete} />;
  }
}
```

### Background Tasks

```typescript
import { registerBackgroundTask, BackgroundTaskName } from '@/lib/background-tasks';

await registerBackgroundTask(BackgroundTaskName.SYNC_DATA, async () => {
  await syncUserData();
  return true;
});
```

### Siri Shortcuts

```typescript
import { donateShortcut, SiriShortcuts } from '@/lib/siri-shortcuts';

// Donate when user performs action
await donateShortcut(SiriShortcuts.OPEN_PREMIUM);
```

### Spotlight Search

```typescript
import { indexItem } from '@/lib/spotlight';

await indexItem({
  id: 'product-123',
  title: 'Premium Subscription',
  keywords: ['premium', 'subscription'],
  deepLink: 'yourapp://product/123',
});
```

### Performance Monitoring

```typescript
import { PerformanceMonitor, useScreenPerformance } from '@/lib/performance-monitor';

function MyScreen() {
  useScreenPerformance('MyScreen');
  return <Content />;
}

// Measure async operations
await PerformanceMonitor.measureAsync('api_call', fetchData);
```

### UI Components

35+ reusable components with NativeWind styling and dark mode support:

| Category  | Components                                         |
| --------- | -------------------------------------------------- |
| Core      | Button, Card, Text, Input, Badge, Avatar           |
| Forms     | FormField, Checkbox, Radio, Switch, Select, Slider |
| Layout    | Screen, Modal, BottomSheet, Tabs, Accordion        |
| Feedback  | Toast, Alert, Loading, Progress, EmptyState        |
| Display   | Timeline, DataTable, Rating, Pagination, Tooltip   |
| Date/Time | DatePicker, Calendar                               |

```tsx
import { Modal, Tabs, Rating, FormField, Timeline } from '@/components/ui';
```

### iOS Widgets

Full WidgetKit support via `@bacons/apple-targets`:

- **Home Screen** - Small, Medium, Large widgets
- **Lock Screen** - Circular, Rectangular, Inline (iOS 16+)
- **Interactive** - Buttons with App Intents (iOS 17+)
- **Live Activities** - Dynamic Island & Lock Screen (iOS 16.1+)

Edit in `targets/widget/index.swift`.

### Feature Flags & A/B Testing

Local feature flags without external services:

```tsx
import { useFeatureFlags } from '@/config/feature-flags';

function MyComponent() {
  const { isEnabled, variant } = useFeatureFlags();

  if (isEnabled('NEW_PAYWALL')) {
    return <NewPaywall />;
  }

  const paywallVariant = variant('PAYWALL_VARIANT'); // 'A' | 'B'
}
```

## Environment Variables

```bash
# Required for payments
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=appl_xxxxx
EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY=goog_xxxxx

# Required for ads
EXPO_PUBLIC_ADMOB_APP_ID_IOS=ca-app-pub-xxxxx~xxxxx
EXPO_PUBLIC_ADMOB_APP_ID_ANDROID=ca-app-pub-xxxxx~xxxxx
EXPO_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-xxxxx/xxxxx
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID=ca-app-pub-xxxxx/xxxxx
EXPO_PUBLIC_ADMOB_REWARDED_ID=ca-app-pub-xxxxx/xxxxx

# Recommended
EXPO_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Optional
EXPO_PUBLIC_API_URL=https://api.yourapp.com
EXPO_PUBLIC_APP_STORE_ID=123456789
EXPO_PUBLIC_PLAY_STORE_ID=com.yourcompany.yourapp
EXPO_PUBLIC_UNIVERSAL_LINKS_DOMAIN=yourapp.com
```

## Project Structure

```
app/                    # Expo Router screens
├── (auth)/            # Login, signup, forgot-password
├── (tabs)/            # Tab screens (home, profile, settings)
└── payment/           # Payment result screen

components/
├── payments/          # Paywall, PremiumGate, SubscriptionStatus
├── ads/               # BannerAd, InterstitialAd, RewardedAd
├── ui/                # 35+ reusable UI components
└── ErrorBoundary.tsx  # Error handling

config/
├── env.ts             # Environment variables
├── product.ts         # RevenueCat products/entitlements
├── ads.ts             # Ad configuration
├── feature-flags.ts   # Local feature flags
└── onboarding.ts      # Onboarding flow

lib/
├── ads.ts             # AdMob integration
├── ads-attribution.ts # Apple Search Ads tracking
├── api.ts             # Network layer with retry/cache
├── network.ts         # Offline support
├── sentry.ts          # Crash reporting
├── i18n.ts            # Localization
├── store-review.ts    # App Store review
├── tracking-transparency.ts # iOS ATT
├── siri-shortcuts.ts  # Siri integration
├── spotlight.ts       # Spotlight indexing
├── background-tasks.ts # Background fetch
├── performance-monitor.ts # Performance tracking
└── ...

targets/
└── widget/            # iOS WidgetKit extension
```

## Commands

```bash
# Development
pnpm start              # Start Expo
pnpm ios                # Run on iOS simulator
pnpm android            # Run on Android emulator

# Code Generation
pnpm generate <type> <name>

# Testing
pnpm test               # Unit tests (Jest)
pnpm e2e                # E2E tests (Maestro)
pnpm lint               # ESLint
pnpm format             # Prettier

# Build & Deploy
pnpm build:ios          # Build iOS (EAS)
pnpm build:android      # Build Android (EAS)
pnpm update             # Publish OTA update
```

## Setup Guides

### RevenueCat Setup

1. Create account at [revenuecat.com](https://app.revenuecat.com)
2. Add your iOS/Android apps
3. Create products in App Store Connect / Google Play Console
4. Add products to RevenueCat
5. Create Offering called "default"
6. Create Entitlement called "premium"
7. Add API keys to `.env`

### AdMob Setup

1. Create account at [admob.google.com](https://admob.google.com)
2. Add your iOS/Android apps
3. Create ad units (banner, interstitial, rewarded)
4. Add app IDs and ad unit IDs to `.env`
5. Update `app.json` with your AdMob app IDs

### Apple Search Ads Setup

1. Create account at [searchads.apple.com](https://searchads.apple.com)
2. Create campaigns for your app
3. Attribution is tracked automatically via `lib/ads-attribution.ts`
4. View attribution data in Search Ads dashboard

## Architecture

### Payment Flow

```
User taps Subscribe
  → RevenueCat SDK handles store purchase
  → RevenueCat validates receipt server-side
  → Customer info updated
  → isPremium state updates
  → Status cached locally
```

### Ad Flow

```
App loads
  → Check if user is premium (skip ads)
  → Initialize AdMob with app ID
  → Preload interstitial/rewarded ads
  → Show banner when ready
  → Track impressions/clicks
```

### Auth Flow

```
User signs up/in
  → Credentials validated locally
  → User ID synced with RevenueCat
  → Session stored in SecureStore
  → Purchases tied to user identity
```

## Security & Privacy

- RevenueCat validates all purchases server-side
- Passwords hashed with expo-crypto before storage
- Sessions stored in SecureStore (Keychain/Keystore)
- Rate limiting prevents brute force attacks
- Privacy Manifest declares all API usage (iOS 17+)
- ATT compliance for ad tracking
- Sensitive data never leaves device (except RevenueCat sync)

## Resources

- [RevenueCat Docs](https://docs.revenuecat.com)
- [AdMob Docs](https://developers.google.com/admob)
- [Apple Search Ads](https://searchads.apple.com)
- [Expo Docs](https://docs.expo.dev)
- [NativeWind Docs](https://nativewind.dev)

## License

MIT
