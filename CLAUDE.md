# CLAUDE.md - AI Agent Technical Reference

Token-optimized guide for AI agents working on this codebase.

## Quick Context

Turborepo monorepo with native Swift iOS app + Hono API on Cloudflare Workers.

- **iOS App**: Swift/SwiftUI, StoreKit 2, Local Authentication
- **API**: Hono, Drizzle ORM, Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Shared**: TypeScript, Zod schemas
- **Build**: Turborepo, pnpm workspaces

## Project Structure

```
/
├── apps/
│   ├── api/                    # Hono API on Cloudflare Workers
│   │   ├── src/
│   │   │   ├── index.ts        # Main entry point
│   │   │   ├── routes/         # API routes
│   │   │   │   ├── auth.ts     # Auth endpoints
│   │   │   │   ├── users.ts    # User management
│   │   │   │   ├── subscriptions.ts  # Subscription management
│   │   │   │   └── webhooks/   # Stripe + Apple webhooks
│   │   │   ├── middleware/     # Auth, CORS, rate limiting
│   │   │   ├── db/             # Drizzle schema
│   │   │   ├── services/       # Business logic
│   │   │   └── types/          # Type definitions
│   │   ├── wrangler.toml       # Cloudflare config
│   │   └── drizzle.config.ts   # Database config
│   │
│   └── ios/                    # Native Swift iOS app
│       ├── Package.swift       # Swift Package Manager
│       └── SwiftStarter/
│           ├── App/            # App entry point
│           │   ├── SwiftStarterApp.swift
│           │   └── ContentView.swift
│           ├── Features/       # Feature modules
│           │   ├── Auth/       # AuthManager, LoginView, SignupView
│           │   ├── Payments/   # StoreManager, PaywallView
│           │   ├── Home/       # HomeView
│           │   ├── Profile/    # ProfileView
│           │   ├── Settings/   # SettingsView
│           │   └── Onboarding/ # OnboardingView
│           └── Core/           # Shared utilities
│               ├── Theme/      # Colors, Typography, Spacing
│               ├── Network/    # APIClient, NetworkMonitor
│               ├── Storage/    # StorageManager, KeychainManager
│               └── Analytics/  # AnalyticsManager
│
├── packages/
│   ├── shared/                 # Shared types and schemas
│   │   └── src/
│   │       ├── types/          # TypeScript interfaces
│   │       ├── schemas/        # Zod validation schemas
│   │       ├── constants/      # Shared constants
│   │       └── utils/          # Utility functions
│   │
│   └── config/                 # Shared configurations
│       ├── typescript/         # tsconfig base
│       └── eslint/             # ESLint config
│
├── .github/workflows/          # CI/CD
│   ├── ci.yml                  # Lint, test, deploy API
│   └── release.yml             # Production deployment
│
├── turbo.json                  # Turborepo config
├── pnpm-workspace.yaml         # Workspace definition
└── package.json                # Root scripts
```

## Key Files to Edit

| Task               | File(s)                                    |
| ------------------ | ------------------------------------------ |
| Add API endpoint   | `apps/api/src/routes/`                     |
| Add API middleware | `apps/api/src/middleware/`                 |
| Database schema    | `apps/api/src/db/schema.ts`                |
| API service logic  | `apps/api/src/services/`                   |
| iOS new screen     | `apps/ios/SwiftStarter/Features/`          |
| iOS payments       | `apps/ios/SwiftStarter/Features/Payments/` |
| iOS auth           | `apps/ios/SwiftStarter/Features/Auth/`     |
| iOS theme          | `apps/ios/SwiftStarter/Core/Theme/`        |
| iOS networking     | `apps/ios/SwiftStarter/Core/Network/`      |
| Shared types       | `packages/shared/src/types/`               |
| Shared validation  | `packages/shared/src/schemas/`             |
| API deployment     | `apps/api/wrangler.toml`                   |
| CI/CD              | `.github/workflows/`                       |

## API Routes

```
GET  /              # API info and health
GET  /health        # Health check

POST /auth/register # Create account
POST /auth/login    # Sign in
POST /auth/refresh  # Refresh token
POST /auth/logout   # Sign out

GET  /users/me      # Get current user
PATCH /users/me     # Update profile
DELETE /users/me    # Delete account

GET  /subscriptions/status   # Get subscription status
POST /subscriptions/verify   # Verify App Store receipt

POST /webhooks/apple         # App Store Server Notifications
POST /webhooks/stripe        # Stripe webhooks
```

## Commands

```bash
# Development
pnpm install              # Install dependencies
pnpm dev                  # Start all apps
pnpm dev:api              # Start API only (http://localhost:8787)

# Build
pnpm build                # Build all packages

# Quality
pnpm lint                 # ESLint
pnpm typecheck            # TypeScript checks
pnpm format               # Prettier format
pnpm format:check         # Check formatting

# Database
pnpm db:generate          # Generate Drizzle migrations
pnpm db:push              # Push schema to D1

# Deploy
pnpm deploy               # Deploy all apps
```

## iOS Development

Open in Xcode:

```bash
open apps/ios/SwiftStarter.xcodeproj
```

Key iOS components:

**StoreManager** (`Features/Payments/StoreManager.swift`):

- StoreKit 2 purchases
- `products` - Available products
- `isPremium` - Premium status
- `purchase(product)` - Purchase a product
- `restorePurchases()` - Restore purchases

**AuthManager** (`Features/Auth/AuthManager.swift`):

- Local auth + API sync
- `signIn(email, password)` - Sign in
- `signUp(email, password)` - Create account
- `signOut()` - Sign out
- `authenticateWithBiometrics()` - Face ID/Touch ID

**APIClient** (`Core/Network/APIClient.swift`):

- Type-safe API calls
- `get<T>(path)` - GET request
- `post<T, B>(path, body)` - POST request

**Theme** (`Core/Theme/`):

- `Colors.swift` - Color definitions
- `Typography.swift` - Font styles
- `Spacing.swift` - Spacing values
- `ViewModifiers.swift` - Reusable modifiers

## Database Schema

Main tables in `apps/api/src/db/schema.ts`:

```typescript
users       # id, email, passwordHash, name, createdAt
sessions    # id, userId, expiresAt
subscriptions  # id, userId, productId, status, platform, expiresAt
receipts    # id, userId, transactionId, productId, environment
```

## Environment Variables

**API** (`.env` or Cloudflare dashboard):

```bash
JWT_SECRET=your-secret-key
```

**Deployment** (GitHub Secrets):

```bash
CLOUDFLARE_API_TOKEN=your-token
```

**iOS** (Xcode):
Configure API_URL in Info.plist or build settings.

## CI/CD

**ci.yml** - Runs on PRs and pushes to main:

1. Lint and type check
2. Build packages
3. Deploy API to Cloudflare (on main)

**release.yml** - Runs on GitHub releases:

1. Deploy production API

Required GitHub Secrets:

- `CLOUDFLARE_API_TOKEN` - Cloudflare API token

## Common Modifications

**Add new API endpoint:**

1. Create route in `apps/api/src/routes/`
2. Add to main app in `apps/api/src/index.ts`
3. Add types to `packages/shared/src/types/`

**Add new iOS screen:**

1. Create view in `apps/ios/SwiftStarter/Features/`
2. Add navigation in `ContentView.swift`

**Add shared type:**

1. Add to `packages/shared/src/types/`
2. Export from `packages/shared/src/index.ts`

**Modify database schema:**

1. Edit `apps/api/src/db/schema.ts`
2. Run `pnpm db:generate`
3. Run `pnpm db:push`

## Deployment

**API:**

```bash
cd apps/api
pnpm deploy
```

**iOS:**

1. Open in Xcode
2. Configure signing
3. Archive and upload to App Store Connect
