# Mobile Starter Kit Refactoring Plan

## Expo + RevenueCat → Full-Stack Monorepo with Native Swift + StoreKit 2

### Executive Summary

Transform the current Expo React Native app with RevenueCat into a **full-stack monorepo** containing:

1. **Native Swift/SwiftUI iOS app** with Apple StoreKit 2 for in-app purchases
2. **Next.js web app** on Cloudflare Pages with Tailwind CSS
3. **Hono API backend** on Cloudflare Workers
4. **Shared packages** for types, validation, and utilities

The Tailwind design system is preserved across all platforms - SwiftUI uses translated design tokens while web uses native Tailwind.

---

## Table of Contents

1. [Monorepo Architecture](#1-monorepo-architecture)
2. [iOS App: Swift + StoreKit 2](#2-ios-app-swift--storekit-2)
3. [Web App: Next.js + Cloudflare Pages](#3-web-app-nextjs--cloudflare-pages)
4. [API: Hono + Cloudflare Workers](#4-api-hono--cloudflare-workers)
5. [Shared Packages](#5-shared-packages)
6. [Phase 1: Monorepo Setup](#phase-1-monorepo-setup)
7. [Phase 2: iOS App Implementation](#phase-2-ios-app-implementation)
8. [Phase 3: API Backend Implementation](#phase-3-api-backend-implementation)
9. [Phase 4: Web App Implementation](#phase-4-web-app-implementation)
10. [Phase 5: Integration & Testing](#phase-5-integration--testing)
11. [Deployment Strategy](#deployment-strategy)
12. [Migration Checklist](#migration-checklist)

---

## 1. Monorepo Architecture

### Overview

A **Turborepo monorepo** structure that houses all applications and shared code:

```
swift-starter-kit/
├── apps/
│   ├── ios/                          # Native Swift iOS app
│   ├── web/                          # Next.js on Cloudflare Pages
│   └── api/                          # Hono on Cloudflare Workers
├── packages/
│   ├── shared/                       # Shared types & utilities
│   ├── ui/                           # Shared React components (web)
│   └── config/                       # Shared configurations
├── tooling/
│   ├── eslint/                       # ESLint configurations
│   ├── typescript/                   # TypeScript configurations
│   └── tailwind/                     # Tailwind preset
├── turbo.json                        # Turborepo configuration
├── package.json                      # Root package.json
├── pnpm-workspace.yaml               # pnpm workspaces
└── README.md
```

### Tech Stack Summary

| Layer        | Technology                         | Deployment         |
| ------------ | ---------------------------------- | ------------------ |
| **iOS App**  | Swift/SwiftUI, StoreKit 2          | App Store          |
| **Web App**  | Next.js 15, Tailwind CSS, React 19 | Cloudflare Pages   |
| **API**      | Hono, Drizzle ORM                  | Cloudflare Workers |
| **Database** | D1 (SQLite) or Turso               | Cloudflare/Turso   |
| **Auth**     | Better Auth or Lucia               | Self-hosted        |
| **Shared**   | TypeScript, Zod                    | NPM workspace      |

---

## 2. iOS App: Swift + StoreKit 2

### Structure

```
apps/ios/
├── SwiftStarter/
│   ├── App/
│   │   ├── SwiftStarterApp.swift          # @main entry point
│   │   ├── AppDelegate.swift              # App lifecycle
│   │   └── ContentView.swift              # Root navigation
│   ├── Features/
│   │   ├── Auth/
│   │   │   ├── AuthManager.swift          # Auth state (syncs with API)
│   │   │   ├── LoginView.swift
│   │   │   ├── SignupView.swift
│   │   │   └── BiometricAuth.swift
│   │   ├── Payments/
│   │   │   ├── StoreManager.swift         # StoreKit 2 manager
│   │   │   ├── PaywallView.swift
│   │   │   ├── SubscriptionStatusView.swift
│   │   │   ├── ProductCard.swift
│   │   │   └── PremiumGate.swift
│   │   ├── Home/
│   │   │   └── HomeView.swift
│   │   ├── Profile/
│   │   │   └── ProfileView.swift
│   │   ├── Settings/
│   │   │   └── SettingsView.swift
│   │   └── Onboarding/
│   │       └── OnboardingView.swift
│   ├── Core/
│   │   ├── Theme/
│   │   │   ├── Theme.swift                # Tailwind tokens → Swift
│   │   │   ├── Colors.swift
│   │   │   ├── Typography.swift
│   │   │   ├── Spacing.swift
│   │   │   └── ViewModifiers.swift
│   │   ├── Storage/
│   │   │   ├── StorageManager.swift
│   │   │   └── KeychainManager.swift
│   │   ├── Network/
│   │   │   ├── APIClient.swift            # Talks to Hono API
│   │   │   └── NetworkMonitor.swift
│   │   └── Analytics/
│   │       └── AnalyticsManager.swift
│   ├── Components/
│   │   ├── Buttons/
│   │   ├── Cards/
│   │   ├── Forms/
│   │   ├── Feedback/
│   │   └── Navigation/
│   ├── Widgets/
│   │   ├── WidgetBundle.swift
│   │   ├── HomeWidget.swift
│   │   ├── LockScreenWidget.swift
│   │   ├── InteractiveWidget.swift
│   │   └── LiveActivity.swift
│   └── Resources/
│       ├── Assets.xcassets/
│       ├── Localizable.strings
│       └── Products.storekit
├── SwiftStarterTests/
├── SwiftStarterUITests/
├── SwiftStarter.xcodeproj
└── Package.swift                          # SPM dependencies
```

### Key Features

- **StoreKit 2** for native in-app purchases (no RevenueCat fees)
- **Server-side receipt validation** via Hono API
- **Widgets**: Home screen, Lock screen, Interactive (iOS 17+)
- **Live Activities**: Dynamic Island support
- **App Intents**: Siri Shortcuts integration
- **Biometrics**: Face ID / Touch ID
- **Push Notifications**: APNs integration

---

## 3. Web App: Next.js + Cloudflare Pages

### Structure

```
apps/web/
├── src/
│   ├── app/                              # App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx                  # Home
│   │   │   ├── settings/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (marketing)/
│   │   │   ├── page.tsx                  # Landing page
│   │   │   ├── pricing/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                          # API routes (optional)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   ├── forms/
│   │   ├── layout/
│   │   └── marketing/
│   ├── lib/
│   │   ├── api.ts                        # API client (calls Hono)
│   │   ├── auth.ts                       # Auth helpers
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-subscription.ts
│   │   └── use-api.ts
│   └── styles/
│       └── globals.css
├── public/
├── next.config.ts
├── tailwind.config.ts                    # Uses shared preset
├── tsconfig.json
├── package.json
└── wrangler.toml                         # Cloudflare Pages config
```

### Key Features

- **Next.js 15** with App Router and Server Components
- **Tailwind CSS** with shared design tokens
- **shadcn/ui** component library
- **Stripe** for web payments (complements StoreKit on iOS)
- **Better Auth** or **Lucia** for authentication
- **Edge-first** deployment on Cloudflare Pages

---

## 4. API: Hono + Cloudflare Workers

### Structure

```
apps/api/
├── src/
│   ├── index.ts                          # Main entry point
│   ├── routes/
│   │   ├── auth.ts                       # Auth endpoints
│   │   ├── users.ts                      # User management
│   │   ├── subscriptions.ts              # Subscription management
│   │   ├── webhooks/
│   │   │   ├── stripe.ts                 # Stripe webhooks
│   │   │   └── apple.ts                  # App Store Server Notifications
│   │   └── index.ts                      # Route aggregator
│   ├── middleware/
│   │   ├── auth.ts                       # JWT validation
│   │   ├── cors.ts
│   │   ├── rate-limit.ts
│   │   └── logger.ts
│   ├── db/
│   │   ├── schema.ts                     # Drizzle schema
│   │   ├── migrations/
│   │   └── index.ts                      # DB client
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── subscription.service.ts
│   │   └── apple-receipt.service.ts      # StoreKit receipt validation
│   ├── lib/
│   │   ├── jwt.ts
│   │   ├── hash.ts
│   │   └── errors.ts
│   └── types/
│       └── env.d.ts                      # Cloudflare bindings
├── drizzle.config.ts
├── wrangler.toml                         # Cloudflare Workers config
├── package.json
└── tsconfig.json
```

### API Routes

```typescript
// Main API structure
GET    /health                    # Health check
POST   /auth/register             # User registration
POST   /auth/login                # Login (email/password)
POST   /auth/login/apple          # Sign in with Apple
POST   /auth/refresh              # Refresh token
POST   /auth/logout               # Logout

GET    /users/me                  # Get current user
PATCH  /users/me                  # Update profile
DELETE /users/me                  # Delete account

GET    /subscriptions/status      # Get subscription status
POST   /subscriptions/verify      # Verify App Store receipt
POST   /subscriptions/sync        # Sync with App Store

POST   /webhooks/stripe           # Stripe webhook
POST   /webhooks/apple            # App Store Server Notifications v2
```

### Database Schema (Drizzle)

```typescript
// apps/api/src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash'),
  appleUserId: text('apple_user_id').unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  productId: text('product_id').notNull(),
  platform: text('platform').notNull(), // 'ios' | 'web'
  status: text('status').notNull(), // 'active' | 'expired' | 'cancelled'
  originalTransactionId: text('original_transaction_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const receipts = sqliteTable('receipts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  transactionId: text('transaction_id').notNull(),
  productId: text('product_id').notNull(),
  purchaseDate: integer('purchase_date', { mode: 'timestamp' }).notNull(),
  expiresDate: integer('expires_date', { mode: 'timestamp' }),
  environment: text('environment').notNull(), // 'sandbox' | 'production'
  rawReceipt: text('raw_receipt'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
```

---

## 5. Shared Packages

### packages/shared

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── user.ts
│   │   ├── subscription.ts
│   │   ├── auth.ts
│   │   └── api.ts
│   ├── schemas/
│   │   ├── auth.schema.ts              # Zod schemas
│   │   ├── user.schema.ts
│   │   └── subscription.schema.ts
│   ├── constants/
│   │   ├── products.ts                 # Product IDs
│   │   ├── entitlements.ts
│   │   └── errors.ts
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
├── package.json
└── tsconfig.json
```

### Example Shared Types

```typescript
// packages/shared/src/types/subscription.ts
export type SubscriptionPlatform = 'ios' | 'web';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial';

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  platform: SubscriptionPlatform;
  status: SubscriptionStatus;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface SubscriptionStatus {
  isPremium: boolean;
  subscription: Subscription | null;
  expiresAt: Date | null;
}
```

```typescript
// packages/shared/src/schemas/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = loginSchema
  .extend({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
```

### packages/config (Tailwind Preset)

```typescript
// packages/config/tailwind/preset.ts
import type { Config } from 'tailwindcss';

export const sharedPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        primary: '#0a7ea4',
        secondary: '#6b7280',
        accent: '#8b5cf6',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '6px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      fontSize: {
        xxs: ['10px', { lineHeight: '14px' }],
      },
    },
  },
};
```

---

## Phase 1: Monorepo Setup

### 1.1 Initialize Monorepo

```bash
# Create project directory
mkdir swift-starter-kit && cd swift-starter-kit

# Initialize pnpm workspace
pnpm init

# Create workspace structure
mkdir -p apps/{ios,web,api}
mkdir -p packages/{shared,config}
mkdir -p tooling/{eslint,typescript,tailwind}
```

### 1.2 Root Configuration Files

**pnpm-workspace.yaml:**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tooling/*'
```

**turbo.json:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    },
    "deploy": {
      "dependsOn": ["build"]
    }
  }
}
```

**package.json (root):**

```json
{
  "name": "swift-starter-kit",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "dev:web": "turbo dev --filter=@starter/web",
    "dev:api": "turbo dev --filter=@starter/api",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "db:generate": "turbo db:generate",
    "db:push": "turbo db:push",
    "deploy": "turbo deploy"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.5.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### 1.3 Shared Packages Setup

**packages/shared/package.json:**

```json
{
  "name": "@starter/shared",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

**packages/config/package.json:**

```json
{
  "name": "@starter/config",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./tailwind": "./tailwind/preset.ts",
    "./eslint": "./eslint/base.js",
    "./typescript": "./typescript/base.json"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0"
  }
}
```

---

## Phase 2: Design System Migration

### 2.1 Translate Tailwind Config to SwiftUI Theme

**Source:** `tailwind.config.js` → **Target:** `Core/Theme/`

### Colors (Colors.swift)

```swift
import SwiftUI

extension Color {
    // Brand Colors (from tailwind.config.js)
    static let brandPrimary = Color(hex: "0a7ea4")      // primary
    static let brandSecondary = Color(hex: "6b7280")    // secondary
    static let brandAccent = Color(hex: "8b5cf6")       // accent

    // Semantic Colors
    static let success = Color(hex: "22c55e")
    static let warning = Color(hex: "f59e0b")
    static let danger = Color(hex: "ef4444")
    static let info = Color(hex: "3b82f6")

    // Background Colors
    static let backgroundLight = Color(hex: "f9fafb")
    static let backgroundDark = Color(hex: "111827")

    // Surface Colors
    static let surfaceLight = Color.white
    static let surfaceDark = Color(hex: "1f2937")

    // Text Colors
    static let textPrimary = Color(hex: "111827")
    static let textSecondary = Color(hex: "6b7280")
    static let textMuted = Color(hex: "9ca3af")

    // Dark mode variants
    static let textPrimaryDark = Color(hex: "f9fafb")
    static let textSecondaryDark = Color(hex: "d1d5db")
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6: (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255, opacity: Double(a) / 255)
    }
}
```

### Typography (Typography.swift)

```swift
import SwiftUI

enum FontSize: CGFloat {
    case xxs = 10
    case xs = 12
    case sm = 14
    case base = 16
    case lg = 18
    case xl = 20
    case xxl = 24
    case xxxl = 30
    case xxxxl = 36
    case xxxxxl = 48
}

struct Typography {
    // System font styles (matching Tailwind sizes)
    static func body(_ size: FontSize = .base, weight: Font.Weight = .regular) -> Font {
        .system(size: size.rawValue, weight: weight)
    }

    static let largeTitle = Font.system(size: 34, weight: .bold)
    static let title = Font.system(size: 28, weight: .bold)
    static let title2 = Font.system(size: 22, weight: .bold)
    static let title3 = Font.system(size: 20, weight: .semibold)
    static let headline = Font.system(size: 17, weight: .semibold)
    static let body = Font.system(size: 17, weight: .regular)
    static let callout = Font.system(size: 16, weight: .regular)
    static let subheadline = Font.system(size: 15, weight: .regular)
    static let footnote = Font.system(size: 13, weight: .regular)
    static let caption = Font.system(size: 12, weight: .regular)
    static let caption2 = Font.system(size: 11, weight: .regular)
}
```

### Spacing (Spacing.swift)

```swift
import SwiftUI

enum Spacing: CGFloat {
    case none = 0
    case xxs = 2
    case xs = 4
    case sm = 8
    case md = 12
    case base = 16
    case lg = 20
    case xl = 24
    case xxl = 32
    case xxxl = 40
    case xxxxl = 48
    case xxxxxl = 64
}

enum CornerRadius: CGFloat {
    case sm = 6
    case base = 8
    case md = 10
    case lg = 12
    case xl = 16
    case xxl = 20
    case xxxl = 24
    case full = 9999
}
```

### View Modifiers (ViewModifiers.swift)

```swift
import SwiftUI

// Card style modifier (matches NativeWind card)
struct CardModifier: ViewModifier {
    @Environment(\.colorScheme) var colorScheme

    func body(content: Content) -> some View {
        content
            .background(colorScheme == .dark ? Color.surfaceDark : Color.surfaceLight)
            .cornerRadius(CornerRadius.lg.rawValue)
            .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

// Primary button style
struct PrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(.white)
            .padding(.horizontal, Spacing.lg.rawValue)
            .padding(.vertical, Spacing.md.rawValue)
            .background(isEnabled ? Color.brandPrimary : Color.gray)
            .cornerRadius(CornerRadius.lg.rawValue)
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.spring(response: 0.2), value: configuration.isPressed)
    }
}

// Press scale animation (matches PressableScale)
struct PressableModifier: ViewModifier {
    @State private var isPressed = false
    var scale: CGFloat = 0.96
    var action: () -> Void

    func body(content: Content) -> some View {
        content
            .scaleEffect(isPressed ? scale : 1.0)
            .animation(.spring(response: 0.2, dampingFraction: 0.7), value: isPressed)
            .simultaneousGesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in isPressed = true }
                    .onEnded { _ in
                        isPressed = false
                        action()
                    }
            )
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardModifier())
    }

    func pressable(scale: CGFloat = 0.96, action: @escaping () -> Void) -> some View {
        modifier(PressableModifier(scale: scale, action: action))
    }
}
```

---

## Phase 3: StoreKit 2 Implementation

### 3.1 StoreKit Configuration File

**Create `Products.storekit` in Xcode:**

1. File → New → File → StoreKit Configuration File
2. Add products matching your App Store Connect setup:

```
Monthly Premium
- ID: com.yourcompany.premium.monthly
- Type: Auto-Renewable Subscription
- Price: $4.99/month
- Group: Premium

Yearly Premium
- ID: com.yourcompany.premium.yearly
- Type: Auto-Renewable Subscription
- Price: $39.99/year
- Group: Premium

Lifetime Premium
- ID: com.yourcompany.premium.lifetime
- Type: Non-Consumable
- Price: $99.99
```

### 3.2 StoreManager (Core Payment Logic)

**Replaces:** `hooks/use-revenuecat.ts` + `services/payments.ts`

```swift
// Features/Payments/StoreManager.swift
import StoreKit

@MainActor
class StoreManager: ObservableObject {
    static let shared = StoreManager()

    // Published properties (like useRevenueCat hook)
    @Published private(set) var products: [Product] = []
    @Published private(set) var purchasedProductIDs = Set<String>()
    @Published private(set) var isLoading = false
    @Published private(set) var error: StoreError?

    // Entitlement check (replaces isPremium from RevenueCat)
    var isPremium: Bool {
        !purchasedProductIDs.intersection(Config.Products.premiumProducts).isEmpty
    }

    private var updateListenerTask: Task<Void, Error>?

    init() {
        updateListenerTask = listenForTransactions()
        Task {
            await loadProducts()
            await updatePurchasedProducts()
        }
    }

    deinit {
        updateListenerTask?.cancel()
    }

    // MARK: - Load Products (replaces RevenueCat offerings)

    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let productIDs: Set<String> = [
                Config.Products.monthlyPremium,
                Config.Products.yearlyPremium,
                Config.Products.lifetimePremium
            ]
            products = try await Product.products(for: productIDs)
                .sorted { $0.price < $1.price }
        } catch {
            self.error = .failedToLoadProducts(error)
        }
    }

    // MARK: - Purchase (replaces purchasePackage)

    func purchase(_ product: Product) async throws -> Transaction? {
        isLoading = true
        defer { isLoading = false }

        let result = try await product.purchase()

        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await transaction.finish()
            await updatePurchasedProducts()
            return transaction

        case .userCancelled:
            return nil

        case .pending:
            throw StoreError.purchasePending

        @unknown default:
            throw StoreError.unknown
        }
    }

    // MARK: - Restore Purchases (replaces restorePurchases)

    func restorePurchases() async throws {
        isLoading = true
        defer { isLoading = false }

        try await AppStore.sync()
        await updatePurchasedProducts()
    }

    // MARK: - Transaction Listener

    private func listenForTransactions() -> Task<Void, Error> {
        Task.detached {
            for await result in Transaction.updates {
                do {
                    let transaction = try self.checkVerified(result)
                    await self.updatePurchasedProducts()
                    await transaction.finish()
                } catch {
                    // Handle verification error
                }
            }
        }
    }

    // MARK: - Update Purchased Products

    func updatePurchasedProducts() async {
        var purchased = Set<String>()

        for await result in Transaction.currentEntitlements {
            do {
                let transaction = try checkVerified(result)
                purchased.insert(transaction.productID)
            } catch {
                // Skip invalid transactions
            }
        }

        purchasedProductIDs = purchased
    }

    // MARK: - Verification

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified:
            throw StoreError.failedVerification
        case .verified(let safe):
            return safe
        }
    }
}

// MARK: - Error Types

enum StoreError: LocalizedError {
    case failedToLoadProducts(Error)
    case failedVerification
    case purchasePending
    case unknown

    var errorDescription: String? {
        switch self {
        case .failedToLoadProducts(let error):
            return "Failed to load products: \(error.localizedDescription)"
        case .failedVerification:
            return "Transaction verification failed"
        case .purchasePending:
            return "Purchase is pending approval"
        case .unknown:
            return "An unknown error occurred"
        }
    }
}
```

### 3.3 PaywallView (Replaces Paywall.tsx)

```swift
// Features/Payments/PaywallView.swift
import SwiftUI
import StoreKit

struct PaywallView: View {
    @StateObject private var store = StoreManager.shared
    @Environment(\.dismiss) private var dismiss
    @State private var selectedProduct: Product?
    @State private var isPurchasing = false
    @State private var showError = false
    @State private var errorMessage = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Spacing.xl.rawValue) {
                    // Header
                    headerSection

                    // Features list
                    featuresSection

                    // Products
                    productsSection

                    // Legal
                    legalSection
                }
                .padding()
            }
            .navigationTitle("Go Premium")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
    }

    private var headerSection: some View {
        VStack(spacing: Spacing.md.rawValue) {
            Image(systemName: "crown.fill")
                .font(.system(size: 60))
                .foregroundColor(.brandAccent)

            Text("Unlock All Features")
                .font(.title2)
                .fontWeight(.bold)

            Text("Get unlimited access to all premium features")
                .font(.subheadline)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
        }
    }

    private var featuresSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md.rawValue) {
            FeatureRow(icon: "checkmark.circle.fill", text: "Unlimited usage")
            FeatureRow(icon: "bolt.fill", text: "Priority support")
            FeatureRow(icon: "icloud.fill", text: "Cloud sync")
            FeatureRow(icon: "nosign", text: "No ads")
        }
        .cardStyle()
        .padding(.horizontal)
    }

    private var productsSection: some View {
        VStack(spacing: Spacing.md.rawValue) {
            if store.isLoading {
                ProgressView()
            } else {
                ForEach(store.products, id: \.id) { product in
                    ProductCardView(
                        product: product,
                        isSelected: selectedProduct?.id == product.id,
                        onSelect: { selectedProduct = product }
                    )
                }
            }

            // Purchase button
            Button(action: purchase) {
                HStack {
                    if isPurchasing {
                        ProgressView()
                            .tint(.white)
                    }
                    Text(isPurchasing ? "Processing..." : "Continue")
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(PrimaryButtonStyle())
            .disabled(selectedProduct == nil || isPurchasing)

            // Restore purchases
            Button("Restore Purchases") {
                Task { try? await store.restorePurchases() }
            }
            .font(.footnote)
            .foregroundColor(.brandPrimary)
        }
    }

    private var legalSection: some View {
        VStack(spacing: Spacing.xs.rawValue) {
            Text("Subscription automatically renews unless canceled 24 hours before the end of the current period.")
                .font(.caption2)
                .foregroundColor(.textMuted)
                .multilineTextAlignment(.center)

            HStack {
                Link("Terms", destination: URL(string: "https://yourapp.com/terms")!)
                Text("•")
                Link("Privacy", destination: URL(string: "https://yourapp.com/privacy")!)
            }
            .font(.caption2)
            .foregroundColor(.brandPrimary)
        }
        .padding(.top)
    }

    private func purchase() {
        guard let product = selectedProduct else { return }

        isPurchasing = true
        Task {
            do {
                _ = try await store.purchase(product)
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
                showError = true
            }
            isPurchasing = false
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: Spacing.md.rawValue) {
            Image(systemName: icon)
                .foregroundColor(.success)
            Text(text)
                .font(.callout)
            Spacer()
        }
    }
}

struct ProductCardView: View {
    let product: Product
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack {
                VStack(alignment: .leading) {
                    Text(product.displayName)
                        .font(.headline)
                    Text(product.description)
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }

                Spacer()

                VStack(alignment: .trailing) {
                    Text(product.displayPrice)
                        .font(.headline)
                    if let subscription = product.subscription {
                        Text(subscription.subscriptionPeriod.debugDescription)
                            .font(.caption2)
                            .foregroundColor(.textMuted)
                    }
                }

                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? .brandPrimary : .textMuted)
            }
            .padding()
            .background(isSelected ? Color.brandPrimary.opacity(0.1) : Color.clear)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.lg.rawValue)
                    .stroke(isSelected ? Color.brandPrimary : Color.gray.opacity(0.3), lineWidth: isSelected ? 2 : 1)
            )
            .cornerRadius(CornerRadius.lg.rawValue)
        }
        .buttonStyle(.plain)
    }
}
```

### 3.4 PremiumGate (Replaces PremiumGate.tsx)

```swift
// Features/Payments/PremiumGate.swift
import SwiftUI

struct PremiumGate<Content: View, Fallback: View>: View {
    @StateObject private var store = StoreManager.shared

    let content: () -> Content
    let fallback: () -> Fallback

    init(
        @ViewBuilder content: @escaping () -> Content,
        @ViewBuilder fallback: @escaping () -> Fallback
    ) {
        self.content = content
        self.fallback = fallback
    }

    var body: some View {
        if store.isPremium {
            content()
        } else {
            fallback()
        }
    }
}

// Convenience initializer with default paywall
extension PremiumGate where Fallback == PaywallPromptView {
    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
        self.fallback = { PaywallPromptView() }
    }
}

struct PaywallPromptView: View {
    @State private var showPaywall = false

    var body: some View {
        VStack(spacing: Spacing.lg.rawValue) {
            Image(systemName: "lock.fill")
                .font(.largeTitle)
                .foregroundColor(.brandAccent)

            Text("Premium Feature")
                .font(.headline)

            Text("Upgrade to access this feature")
                .font(.subheadline)
                .foregroundColor(.textSecondary)

            Button("Upgrade Now") {
                showPaywall = true
            }
            .buttonStyle(PrimaryButtonStyle())
        }
        .sheet(isPresented: $showPaywall) {
            PaywallView()
        }
    }
}
```

---

## Phase 4: Core Features Migration

### 4.1 Authentication

**Replaces:** `context/AuthContext.tsx`, `lib/auth.ts`, `hooks/use-biometric.ts`

```swift
// Features/Auth/AuthManager.swift
import LocalAuthentication
import KeychainAccess

@MainActor
class AuthManager: ObservableObject {
    static let shared = AuthManager()

    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false

    private let keychain = Keychain(service: "com.yourcompany.swiftStarter")

    struct User: Codable {
        let id: String
        let email: String
        let createdAt: Date
    }

    init() {
        loadSavedUser()
    }

    // MARK: - Email/Password Auth

    func signIn(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }

        // Local auth (same as React Native version)
        guard let savedHash = try? keychain.get("password_hash"),
              hashPassword(password) == savedHash else {
            throw AuthError.invalidCredentials
        }

        let user = User(id: UUID().uuidString, email: email, createdAt: Date())
        currentUser = user
        isAuthenticated = true
        saveUser(user)
    }

    func signUp(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }

        // Validate password strength
        guard isPasswordStrong(password) else {
            throw AuthError.weakPassword
        }

        // Store credentials locally
        try keychain.set(hashPassword(password), key: "password_hash")
        try keychain.set(email, key: "email")

        let user = User(id: UUID().uuidString, email: email, createdAt: Date())
        currentUser = user
        isAuthenticated = true
        saveUser(user)
    }

    func signOut() {
        currentUser = nil
        isAuthenticated = false
        UserDefaults.standard.removeObject(forKey: "currentUser")
    }

    // MARK: - Biometric Auth

    var biometricType: LABiometryType {
        let context = LAContext()
        _ = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
        return context.biometryType
    }

    var isBiometricAvailable: Bool {
        let context = LAContext()
        return context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
    }

    func authenticateWithBiometrics() async throws -> Bool {
        let context = LAContext()
        let reason = "Unlock your account"

        return try await context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: reason
        )
    }

    // MARK: - Apple Sign In

    func signInWithApple(idToken: String, user: String?) async throws {
        // Handle Apple Sign In credential
        let userId = user ?? UUID().uuidString
        let appleUser = User(id: userId, email: "", createdAt: Date())
        currentUser = appleUser
        isAuthenticated = true
        saveUser(appleUser)
    }

    // MARK: - Private Helpers

    private func loadSavedUser() {
        guard let data = UserDefaults.standard.data(forKey: "currentUser"),
              let user = try? JSONDecoder().decode(User.self, from: data) else {
            return
        }
        currentUser = user
        isAuthenticated = true
    }

    private func saveUser(_ user: User) {
        if let data = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(data, forKey: "currentUser")
        }
    }

    private func hashPassword(_ password: String) -> String {
        // Use proper hashing in production
        return password.data(using: .utf8)!.base64EncodedString()
    }

    private func isPasswordStrong(_ password: String) -> Bool {
        password.count >= 8 &&
        password.rangeOfCharacter(from: .uppercaseLetters) != nil &&
        password.rangeOfCharacter(from: .lowercaseLetters) != nil &&
        password.rangeOfCharacter(from: .decimalDigits) != nil
    }
}

enum AuthError: LocalizedError {
    case invalidCredentials
    case weakPassword
    case biometricFailed

    var errorDescription: String? {
        switch self {
        case .invalidCredentials: return "Invalid email or password"
        case .weakPassword: return "Password must be at least 8 characters with uppercase, lowercase, and numbers"
        case .biometricFailed: return "Biometric authentication failed"
        }
    }
}
```

### 4.2 Storage

**Replaces:** `lib/storage.ts`

```swift
// Core/Storage/StorageManager.swift
import Foundation

class StorageManager {
    static let shared = StorageManager()

    private let defaults = UserDefaults.standard
    private let appGroup = UserDefaults(suiteName: Config.appGroupId)

    // MARK: - Basic Storage

    func set<T: Encodable>(_ value: T, forKey key: String) {
        if let data = try? JSONEncoder().encode(value) {
            defaults.set(data, forKey: key)
        }
    }

    func get<T: Decodable>(_ type: T.Type, forKey key: String) -> T? {
        guard let data = defaults.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }

    func remove(forKey key: String) {
        defaults.removeObject(forKey: key)
    }

    // MARK: - App Group Storage (for widgets)

    func setShared<T: Encodable>(_ value: T, forKey key: String) {
        if let data = try? JSONEncoder().encode(value) {
            appGroup?.set(data, forKey: key)
        }
    }

    func getShared<T: Decodable>(_ type: T.Type, forKey key: String) -> T? {
        guard let data = appGroup?.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }
}

// Storage Keys (matching React Native version)
enum StorageKey {
    static let subscriptionStatus = "subscription:status"
    static let onboardingComplete = "onboarding:complete"
    static let themePreference = "user:theme"
    static let lastSyncDate = "sync:last"
}
```

### 4.3 Analytics

**Replaces:** `lib/analytics.ts`

```swift
// Core/Analytics/AnalyticsManager.swift
import Foundation

class AnalyticsManager {
    static let shared = AnalyticsManager()

    enum Event: String {
        case appOpened = "app_opened"
        case screenViewed = "screen_viewed"
        case checkoutStarted = "checkout_started"
        case purchaseCompleted = "purchase_completed"
        case purchaseFailed = "purchase_failed"
        case subscriptionRestored = "subscription_restored"
        case featureUsed = "feature_used"
        case signUp = "sign_up"
        case login = "login"
        case logout = "logout"
    }

    func track(_ event: Event, properties: [String: Any]? = nil) {
        #if DEBUG
        print("📊 Analytics: \(event.rawValue)", properties ?? [:])
        #endif

        // Add your analytics provider here (Mixpanel, Amplitude, etc.)
    }

    func setUser(id: String, properties: [String: Any]? = nil) {
        #if DEBUG
        print("👤 Set User: \(id)", properties ?? [:])
        #endif
    }

    func reset() {
        // Clear user on logout
    }
}
```

### 4.4 Network Layer

**Replaces:** `lib/api.ts`, `lib/network.ts`

```swift
// Core/Network/APIClient.swift
import Foundation
import Network

actor APIClient {
    static let shared = APIClient()

    private let session = URLSession.shared
    private let baseURL: URL
    private var cache: [String: (data: Data, expiry: Date)] = [:]

    init() {
        self.baseURL = URL(string: Config.apiURL ?? "")!
    }

    func get<T: Decodable>(_ path: String, cacheTTL: TimeInterval? = nil) async throws -> T {
        let url = baseURL.appendingPathComponent(path)

        // Check cache
        if let ttl = cacheTTL,
           let cached = cache[path],
           cached.expiry > Date() {
            return try JSONDecoder().decode(T.self, from: cached.data)
        }

        let (data, _) = try await session.data(from: url)

        // Cache response
        if let ttl = cacheTTL {
            cache[path] = (data, Date().addingTimeInterval(ttl))
        }

        return try JSONDecoder().decode(T.self, from: data)
    }

    func post<T: Decodable, B: Encodable>(_ path: String, body: B) async throws -> T {
        var request = URLRequest(url: baseURL.appendingPathComponent(path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(body)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(T.self, from: data)
    }
}

// Network Monitor
@MainActor
class NetworkMonitor: ObservableObject {
    static let shared = NetworkMonitor()

    @Published var isConnected = true
    @Published var connectionType: NWInterface.InterfaceType?

    private let monitor = NWPathMonitor()

    init() {
        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor in
                self?.isConnected = path.status == .satisfied
                self?.connectionType = path.availableInterfaces.first?.type
            }
        }
        monitor.start(queue: DispatchQueue.global())
    }
}
```

---

## Phase 5: UI Components Migration

### 5.1 Component Mapping Table

| NativeWind Component | SwiftUI Component                  | Priority |
| -------------------- | ---------------------------------- | -------- |
| `Button`             | `PrimaryButton`, `SecondaryButton` | High     |
| `Card`               | `CardView`                         | High     |
| `Text`               | Native `Text` with modifiers       | High     |
| `Input`              | `CustomTextField`                  | High     |
| `Modal`              | `.sheet()` modifier                | High     |
| `BottomSheet`        | `.sheet(detents:)`                 | High     |
| `Toast`              | Custom overlay                     | Medium   |
| `Loading`            | `ProgressView`                     | High     |
| `EmptyState`         | `EmptyStateView`                   | Medium   |
| `Badge`              | `BadgeView`                        | Medium   |
| `Avatar`             | `AvatarView`                       | Medium   |
| `Tabs`               | `TabView`                          | High     |
| `Accordion`          | `DisclosureGroup`                  | Low      |
| `Skeleton`           | Custom shimmer view                | Medium   |
| `FadeIn`, `SlideIn`  | `.transition()` + `.animation()`   | Medium   |
| `PressableScale`     | `.pressable()` modifier            | High     |
| Custom Tab Bar       | `CustomTabBar`                     | High     |

### 5.2 Sample UI Components

```swift
// Components/Buttons/PrimaryButton.swift
import SwiftUI

struct PrimaryButton: View {
    let title: String
    let isLoading: Bool
    let action: () -> Void

    init(_ title: String, isLoading: Bool = false, action: @escaping () -> Void) {
        self.title = title
        self.isLoading = isLoading
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: Spacing.sm.rawValue) {
                if isLoading {
                    ProgressView()
                        .tint(.white)
                }
                Text(title)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(PrimaryButtonStyle())
        .disabled(isLoading)
    }
}

// Components/Cards/Card.swift
struct Card<Content: View>: View {
    let content: () -> Content

    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md.rawValue) {
            content()
        }
        .padding(Spacing.lg.rawValue)
        .cardStyle()
    }
}

// Components/Forms/CustomTextField.swift
struct CustomTextField: View {
    let placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var error: String?

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs.rawValue) {
            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                }
            }
            .padding(Spacing.md.rawValue)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(CornerRadius.md.rawValue)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.md.rawValue)
                    .stroke(error != nil ? Color.danger : Color.clear, lineWidth: 1)
            )

            if let error = error {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.danger)
            }
        }
    }
}

// Components/Feedback/Toast.swift
struct ToastModifier: ViewModifier {
    @Binding var isPresented: Bool
    let message: String
    let type: ToastType

    enum ToastType {
        case success, error, warning, info

        var color: Color {
            switch self {
            case .success: return .success
            case .error: return .danger
            case .warning: return .warning
            case .info: return .info
            }
        }

        var icon: String {
            switch self {
            case .success: return "checkmark.circle.fill"
            case .error: return "xmark.circle.fill"
            case .warning: return "exclamationmark.triangle.fill"
            case .info: return "info.circle.fill"
            }
        }
    }

    func body(content: Content) -> some View {
        ZStack {
            content

            if isPresented {
                VStack {
                    Spacer()

                    HStack(spacing: Spacing.sm.rawValue) {
                        Image(systemName: type.icon)
                        Text(message)
                    }
                    .padding()
                    .background(type.color)
                    .foregroundColor(.white)
                    .cornerRadius(CornerRadius.lg.rawValue)
                    .padding()
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                .animation(.spring(), value: isPresented)
                .onAppear {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                        isPresented = false
                    }
                }
            }
        }
    }
}

extension View {
    func toast(isPresented: Binding<Bool>, message: String, type: ToastModifier.ToastType = .info) -> some View {
        modifier(ToastModifier(isPresented: isPresented, message: message, type: type))
    }
}
```

---

## Phase 6: iOS Features Migration

### 6.1 Widgets (Enhanced from existing)

**The current `targets/widget/index.swift` can be largely reused** but should be updated to:

1. Read premium status from App Group UserDefaults
2. Use the new theme system
3. Add proper deep linking

```swift
// Widgets/WidgetBundle.swift
import WidgetKit
import SwiftUI

@main
struct StarterWidgets: WidgetBundle {
    var body: some Widget {
        HomeWidget()
        LockScreenWidget()
        if #available(iOS 17.0, *) {
            InteractiveWidget()
        }
    }
}

// Widgets/HomeWidget.swift
struct HomeWidget: Widget {
    let kind = "HomeWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            HomeWidgetView(entry: entry)
        }
        .configurationDisplayName("Quick Stats")
        .description("View your stats at a glance")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WidgetEntry {
        WidgetEntry(date: Date(), isPremium: false, stats: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (WidgetEntry) -> Void) {
        let entry = WidgetEntry(date: Date(), isPremium: loadPremiumStatus(), stats: loadStats())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<WidgetEntry>) -> Void) {
        let entry = WidgetEntry(date: Date(), isPremium: loadPremiumStatus(), stats: loadStats())
        let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600)))
        completion(timeline)
    }

    private func loadPremiumStatus() -> Bool {
        let defaults = UserDefaults(suiteName: Config.appGroupId)
        return defaults?.bool(forKey: "isPremium") ?? false
    }

    private func loadStats() -> WidgetStats {
        let defaults = UserDefaults(suiteName: Config.appGroupId)
        guard let data = defaults?.data(forKey: "widgetStats"),
              let stats = try? JSONDecoder().decode(WidgetStats.self, from: data) else {
            return .placeholder
        }
        return stats
    }
}
```

### 6.2 Live Activities

```swift
// Widgets/LiveActivity.swift
import ActivityKit
import WidgetKit
import SwiftUI

struct ProgressActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var progress: Double
        var status: String
    }

    var title: String
}

@available(iOS 16.1, *)
struct ProgressLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ProgressActivityAttributes.self) { context in
            // Lock screen view
            HStack {
                VStack(alignment: .leading) {
                    Text(context.attributes.title)
                        .font(.headline)
                    Text(context.state.status)
                        .font(.caption)
                }

                Spacer()

                CircularProgressView(progress: context.state.progress)
            }
            .padding()
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(context.attributes.title)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(Int(context.state.progress * 100))%")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ProgressView(value: context.state.progress)
                }
            } compactLeading: {
                Image(systemName: "arrow.down.circle.fill")
            } compactTrailing: {
                Text("\(Int(context.state.progress * 100))%")
            } minimal: {
                Image(systemName: "arrow.down.circle.fill")
            }
        }
    }
}
```

### 6.3 App Intents (Siri Shortcuts)

**Replaces:** `lib/siri-shortcuts.ts`

```swift
// Features/Intents/AppIntents.swift
import AppIntents

struct OpenPremiumIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Premium"
    static var description = IntentDescription("Open the premium features screen")

    @MainActor
    func perform() async throws -> some IntentResult {
        // Handle deep link to premium screen
        NotificationCenter.default.post(name: .openPremium, object: nil)
        return .result()
    }
}

struct QuickActionIntent: AppIntent {
    static var title: LocalizedStringResource = "Quick Action"

    @Parameter(title: "Action Type")
    var actionType: String

    @MainActor
    func perform() async throws -> some IntentResult {
        // Handle quick action
        return .result()
    }
}

// App Shortcuts
struct AppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: OpenPremiumIntent(),
            phrases: ["Open premium in \(.applicationName)"],
            shortTitle: "Premium",
            systemImageName: "crown.fill"
        )
    }
}
```

### 6.4 Background Tasks

**Replaces:** `lib/background-tasks.ts`

```swift
// Core/BackgroundTasks/BackgroundTaskManager.swift
import BackgroundTasks

class BackgroundTaskManager {
    static let shared = BackgroundTaskManager()

    static let syncTaskId = "com.yourcompany.swiftStarter.sync"
    static let refreshTaskId = "com.yourcompany.swiftStarter.refresh"

    func registerTasks() {
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: Self.syncTaskId,
            using: nil
        ) { task in
            self.handleSyncTask(task as! BGProcessingTask)
        }

        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: Self.refreshTaskId,
            using: nil
        ) { task in
            self.handleRefreshTask(task as! BGAppRefreshTask)
        }
    }

    func scheduleSync() {
        let request = BGProcessingTaskRequest(identifier: Self.syncTaskId)
        request.requiresNetworkConnectivity = true
        request.requiresExternalPower = false

        try? BGTaskScheduler.shared.submit(request)
    }

    func scheduleRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: Self.refreshTaskId)
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes

        try? BGTaskScheduler.shared.submit(request)
    }

    private func handleSyncTask(_ task: BGProcessingTask) {
        task.expirationHandler = { task.setTaskCompleted(success: false) }

        Task {
            // Perform sync
            await performSync()
            task.setTaskCompleted(success: true)
            scheduleSync()
        }
    }

    private func handleRefreshTask(_ task: BGAppRefreshTask) {
        task.expirationHandler = { task.setTaskCompleted(success: false) }

        Task {
            // Refresh data
            await refreshData()
            task.setTaskCompleted(success: true)
            scheduleRefresh()
        }
    }

    private func performSync() async {
        // Sync implementation
    }

    private func refreshData() async {
        // Refresh implementation
    }
}
```

---

## Phase 7: Testing & Deployment

### 7.1 Unit Tests

```swift
// Tests/UnitTests/StoreManagerTests.swift
import XCTest
import StoreKitTest
@testable import SwiftStarter

final class StoreManagerTests: XCTestCase {
    var store: StoreManager!
    var session: SKTestSession!

    override func setUp() async throws {
        session = try SKTestSession(configurationFileNamed: "Products")
        session.disableDialogs = true
        session.clearTransactions()
        store = StoreManager.shared
    }

    func testLoadProducts() async throws {
        await store.loadProducts()
        XCTAssertFalse(store.products.isEmpty)
    }

    func testPurchaseFlow() async throws {
        await store.loadProducts()
        guard let product = store.products.first else {
            XCTFail("No products available")
            return
        }

        let transaction = try await store.purchase(product)
        XCTAssertNotNil(transaction)
        XCTAssertTrue(store.isPremium)
    }

    func testRestorePurchases() async throws {
        // Simulate a previous purchase
        try await session.buyProduct(identifier: Config.Products.monthlyPremium)

        try await store.restorePurchases()
        XCTAssertTrue(store.isPremium)
    }
}
```

### 7.2 UI Tests

```swift
// Tests/UITests/PaywallUITests.swift
import XCTest

final class PaywallUITests: XCTestCase {
    let app = XCUIApplication()

    override func setUp() {
        continueAfterFailure = false
        app.launch()
    }

    func testPaywallDisplaysProducts() {
        // Navigate to paywall
        app.buttons["Upgrade"].tap()

        // Verify products are displayed
        XCTAssertTrue(app.staticTexts["Monthly Premium"].exists)
        XCTAssertTrue(app.staticTexts["Yearly Premium"].exists)
    }

    func testSelectProductAndPurchase() {
        app.buttons["Upgrade"].tap()

        // Select a product
        app.buttons["Monthly Premium"].tap()

        // Verify selection
        XCTAssertTrue(app.buttons["Continue"].isEnabled)
    }
}
```

### 7.3 CI/CD (GitHub Actions)

```yaml
# .github/workflows/ios.yml
name: iOS Build & Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: macos-14

    steps:
      - uses: actions/checkout@v4

      - name: Select Xcode
        run: sudo xcode-select -s /Applications/Xcode_15.2.app

      - name: Install dependencies
        run: |
          brew install swiftlint

      - name: Lint
        run: swiftlint lint --strict

      - name: Build
        run: |
          xcodebuild build \
            -scheme SwiftStarter \
            -destination 'platform=iOS Simulator,name=iPhone 15' \
            -configuration Debug

      - name: Test
        run: |
          xcodebuild test \
            -scheme SwiftStarter \
            -destination 'platform=iOS Simulator,name=iPhone 15' \
            -configuration Debug

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: macos-14

    steps:
      - uses: actions/checkout@v4

      - name: Install Fastlane
        run: gem install fastlane

      - name: Deploy to TestFlight
        env:
          APP_STORE_CONNECT_API_KEY: ${{ secrets.ASC_API_KEY }}
        run: fastlane beta
```

---

## File-by-File Migration Map

### Critical Path (Must Complete First)

| React Native File         | Swift Equivalent                       | Notes          |
| ------------------------- | -------------------------------------- | -------------- |
| `hooks/use-revenuecat.ts` | `Features/Payments/StoreManager.swift` | StoreKit 2     |
| `services/payments.ts`    | (merged into StoreManager)             | Simplified     |
| `config/product.ts`       | `Configuration/ProductConfig.swift`    | Keep structure |
| `context/AuthContext.tsx` | `Features/Auth/AuthManager.swift`      | Observable     |
| `app/_layout.tsx`         | `App/SwiftStarterApp.swift`            | @main entry    |
| `tailwind.config.js`      | `Core/Theme/*.swift`                   | Design tokens  |

### Payment Components

| React Native                                 | Swift                                            |
| -------------------------------------------- | ------------------------------------------------ |
| `components/payments/Paywall.tsx`            | `Features/Payments/PaywallView.swift`            |
| `components/payments/PremiumGate.tsx`        | `Features/Payments/PremiumGate.swift`            |
| `components/payments/SubscriptionStatus.tsx` | `Features/Payments/SubscriptionStatusView.swift` |
| `components/payments/RestorePurchases.tsx`   | (button in PaywallView)                          |
| `components/payments/ProductCard.tsx`        | `Features/Payments/ProductCardView.swift`        |

### Screens

| React Native                   | Swift                                      |
| ------------------------------ | ------------------------------------------ |
| `app/(tabs)/index.tsx`         | `Features/Home/HomeView.swift`             |
| `app/(tabs)/profile.tsx`       | `Features/Profile/ProfileView.swift`       |
| `app/(tabs)/settings.tsx`      | `Features/Settings/SettingsView.swift`     |
| `app/(auth)/login.tsx`         | `Features/Auth/LoginView.swift`            |
| `app/(auth)/signup.tsx`        | `Features/Auth/SignupView.swift`           |
| `app/account/subscription.tsx` | `Features/Settings/SubscriptionView.swift` |

### UI Components

| React Native                 | Swift                                    |
| ---------------------------- | ---------------------------------------- |
| `components/ui/Button.tsx`   | `Components/Buttons/PrimaryButton.swift` |
| `components/ui/Card.tsx`     | `Components/Cards/Card.swift`            |
| `components/ui/Modal.tsx`    | Native `.sheet()`                        |
| `components/ui/Toast.tsx`    | `Components/Feedback/Toast.swift`        |
| `components/ui/Loading.tsx`  | Native `ProgressView`                    |
| `components/ui/Input.tsx`    | `Components/Forms/CustomTextField.swift` |
| `components/ui/Skeleton.tsx` | `Components/Feedback/SkeletonView.swift` |

### Libraries

| React Native              | Swift                                              |
| ------------------------- | -------------------------------------------------- |
| `lib/storage.ts`          | `Core/Storage/StorageManager.swift`                |
| `lib/auth.ts`             | `Features/Auth/AuthManager.swift`                  |
| `lib/analytics.ts`        | `Core/Analytics/AnalyticsManager.swift`            |
| `lib/api.ts`              | `Core/Network/APIClient.swift`                     |
| `lib/network.ts`          | `Core/Network/NetworkMonitor.swift`                |
| `lib/sentry.ts`           | Sentry SDK (SPM)                                   |
| `lib/siri-shortcuts.ts`   | `Features/Intents/AppIntents.swift`                |
| `lib/background-tasks.ts` | `Core/BackgroundTasks/BackgroundTaskManager.swift` |
| `lib/animations.ts`       | SwiftUI native animations                          |

### iOS-Specific (Enhanced)

| Existing                     | Enhanced Swift                             |
| ---------------------------- | ------------------------------------------ |
| `targets/widget/index.swift` | `Widgets/` directory (modularized)         |
| -                            | `Features/Intents/AppIntents.swift` (Siri) |
| -                            | Live Activities support                    |
| -                            | App Clips (optional)                       |

---

## Dependencies Comparison

### Removed (React Native)

```json
{
  "react-native-purchases": "removed",
  "react-native-purchases-ui": "removed",
  "nativewind": "replaced with SwiftUI theme",
  "react-native-reanimated": "SwiftUI animations",
  "expo-*": "all Expo packages removed",
  "react": "removed",
  "react-native": "removed"
}
```

### Added (Swift)

```swift
// Package.swift / SPM
dependencies: [
    .package(url: "https://github.com/getsentry/sentry-cocoa", from: "8.0.0"),
    .package(url: "https://github.com/kishikawakatsumi/KeychainAccess", from: "4.2.0"),
    .package(url: "https://github.com/onevcat/Kingfisher", from: "7.0.0"),
    .package(url: "https://github.com/realm/SwiftLint", from: "0.54.0")
]
```

### Native Frameworks (No packages needed)

- StoreKit (in-app purchases)
- WidgetKit (widgets)
- ActivityKit (Live Activities)
- LocalAuthentication (biometrics)
- BackgroundTasks
- AppIntents (Siri)
- CoreSpotlight
- Network (connectivity)

---

## Risk Assessment

### High Risk

1. **StoreKit 2 testing** - Requires App Store Connect setup and sandbox testing
2. **Widget data sharing** - App Groups must be configured correctly
3. **Biometric fallback** - Must handle passcode fallback properly

### Medium Risk

1. **Design parity** - Ensuring SwiftUI matches NativeWind designs exactly
2. **Animation differences** - SwiftUI animations behave differently
3. **Deep linking** - Universal links setup can be tricky

### Low Risk

1. **Local storage** - UserDefaults/Keychain are well-documented
2. **Network layer** - URLSession is stable and well-tested
3. **Analytics** - Simple event tracking

---

## Deployment Strategy

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Pages     │    │   Workers   │    │        D1          │  │
│  │  (Next.js)  │───▶│   (Hono)    │───▶│   (SQLite DB)      │  │
│  │             │    │             │    │                     │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│         │                  │                                     │
│         │                  │                                     │
│         ▼                  ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    KV / R2 Storage                          ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
              ┌───────────────┴───────────────┐
              │                               │
        ┌─────────────┐               ┌─────────────┐
        │   iOS App   │               │   Browser   │
        │  (StoreKit) │               │   (Stripe)  │
        └─────────────┘               └─────────────┘
```

### Environment Configuration

**apps/api/wrangler.toml:**

```toml
name = "starter-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "starter-db"
database_id = "your-database-id"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-id"

[env.staging]
name = "starter-api-staging"
vars = { ENVIRONMENT = "staging" }

[env.development]
name = "starter-api-dev"
vars = { ENVIRONMENT = "development" }
```

**apps/web/wrangler.toml:**

```toml
name = "starter-web"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".vercel/output/static"

[vars]
NEXT_PUBLIC_API_URL = "https://api.yourapp.com"
```

### CI/CD Pipeline

**.github/workflows/deploy.yml:**

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test

  deploy-api:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - name: Deploy API to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: apps/api

  deploy-web:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build --filter=@starter/web
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy apps/web/.vercel/output/static --project-name=starter-web

  build-ios:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - name: Select Xcode
        run: sudo xcode-select -s /Applications/Xcode_15.2.app
      - name: Build iOS
        run: |
          cd apps/ios
          xcodebuild build \
            -scheme SwiftStarter \
            -destination 'generic/platform=iOS' \
            -configuration Release
      - name: Deploy to TestFlight
        if: github.event_name == 'push'
        run: |
          cd apps/ios
          fastlane beta
        env:
          APP_STORE_CONNECT_API_KEY: ${{ secrets.ASC_API_KEY }}
```

### Database Migrations

```bash
# Generate migration
pnpm --filter @starter/api db:generate

# Push to D1
pnpm --filter @starter/api db:push

# For production, use wrangler
cd apps/api
wrangler d1 migrations apply starter-db --remote
```

---

## Migration Checklist

### Phase 1: Monorepo Setup

- [ ] Initialize Turborepo with pnpm workspaces
- [ ] Set up shared packages (types, config, validation)
- [ ] Configure Tailwind preset for shared theme
- [ ] Set up ESLint and TypeScript configs
- [ ] Create root scripts for dev/build/deploy

### Phase 2: API Backend (Hono + Cloudflare)

- [ ] Initialize Hono app with TypeScript
- [ ] Set up Drizzle ORM with D1 schema
- [ ] Implement auth routes (register, login, Apple Sign In)
- [ ] Implement user routes
- [ ] Implement subscription routes
- [ ] Add App Store receipt validation service
- [ ] Add Stripe webhook handler
- [ ] Add Apple Server Notifications webhook
- [ ] Configure rate limiting and CORS
- [ ] Write API tests
- [ ] Deploy to Cloudflare Workers

### Phase 3: iOS App (Swift + StoreKit 2)

- [ ] Create Xcode project in apps/ios
- [ ] Implement SwiftUI theme (from Tailwind tokens)
- [ ] Implement StoreManager with StoreKit 2
- [ ] Connect to Hono API for auth
- [ ] Implement server-side receipt validation
- [ ] Build auth screens (login, signup, biometrics)
- [ ] Build main screens (home, profile, settings)
- [ ] Build paywall with product selection
- [ ] Implement widgets (home, lock screen, interactive)
- [ ] Implement Live Activities
- [ ] Add App Intents for Siri
- [ ] Write unit and UI tests
- [ ] Configure App Store Connect products
- [ ] Submit to TestFlight

### Phase 4: Web App (Next.js + Cloudflare Pages)

- [ ] Initialize Next.js 15 with App Router
- [ ] Configure Tailwind with shared preset
- [ ] Set up shadcn/ui components
- [ ] Implement auth pages
- [ ] Implement dashboard pages
- [ ] Implement marketing pages (landing, pricing)
- [ ] Add Stripe integration for web payments
- [ ] Connect to Hono API
- [ ] Write tests
- [ ] Deploy to Cloudflare Pages

### Phase 5: Integration & Polish

- [ ] Test cross-platform subscription sync
- [ ] Test iOS receipt validation flow
- [ ] Test Stripe + App Store subscription parity
- [ ] Add error tracking (Sentry)
- [ ] Add analytics
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

### Phase 6: Deployment

- [ ] Set up Cloudflare account and D1 database
- [ ] Configure environment secrets in GitHub
- [ ] Set up App Store Connect
- [ ] Configure Stripe production keys
- [ ] Deploy API to production
- [ ] Deploy web to production
- [ ] Submit iOS to App Store review

---

## Summary

This plan transforms the Expo + RevenueCat starter into a **production-ready full-stack monorepo**:

| Component          | Before              | After                        |
| ------------------ | ------------------- | ---------------------------- |
| **iOS App**        | Expo + React Native | Native Swift/SwiftUI         |
| **Payments (iOS)** | RevenueCat          | StoreKit 2 (native)          |
| **Payments (Web)** | N/A                 | Stripe                       |
| **Backend**        | None (local only)   | Hono on Cloudflare Workers   |
| **Database**       | AsyncStorage        | D1 (SQLite)                  |
| **Web App**        | N/A                 | Next.js on Cloudflare Pages  |
| **Styling**        | NativeWind          | SwiftUI Theme + Tailwind CSS |
| **Auth**           | Local               | Server-side with sessions    |

### Key Benefits

1. **No RevenueCat fees** - Direct StoreKit 2 integration
2. **Full iOS feature access** - Widgets, Live Activities, App Intents
3. **Edge-first backend** - Cloudflare Workers for low latency globally
4. **Unified subscription management** - Single source of truth across platforms
5. **Type-safe across stack** - Shared TypeScript/Zod schemas
6. **Consistent design** - Tailwind tokens shared between web and iOS

### Getting Started

```bash
# Clone and install
git clone <repo> swift-starter-kit
cd swift-starter-kit
pnpm install

# Start development
pnpm dev           # Start all apps
pnpm dev:api       # API only
pnpm dev:web       # Web only

# iOS development (requires macOS)
cd apps/ios
open SwiftStarter.xcodeproj
```
