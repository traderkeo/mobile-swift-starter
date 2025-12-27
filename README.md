# Swift Starter Kit

A production-ready **monorepo** for building iOS apps with a serverless API backend.

## Stack

| Layer        | Technology                | Deployment         |
| ------------ | ------------------------- | ------------------ |
| **iOS App**  | Swift/SwiftUI, StoreKit 2 | App Store          |
| **API**      | Hono, Drizzle ORM         | Cloudflare Workers |
| **Database** | Cloudflare D1 (SQLite)    | Cloudflare         |
| **Shared**   | TypeScript, Zod           | NPM workspace      |

## Project Structure

```
├── apps/
│   ├── api/                    # Hono API on Cloudflare Workers
│   │   ├── src/
│   │   │   ├── routes/         # API routes (auth, users, subscriptions)
│   │   │   ├── middleware/     # Auth, CORS, rate limiting
│   │   │   ├── db/             # Drizzle schema and queries
│   │   │   ├── services/       # Business logic
│   │   │   └── index.ts        # Main entry point
│   │   ├── wrangler.toml       # Cloudflare Workers config
│   │   └── drizzle.config.ts   # Database config
│   │
│   └── ios/                    # Native Swift iOS app
│       ├── Package.swift       # Swift Package Manager
│       └── SwiftStarter/
│           ├── App/            # App entry point
│           ├── Features/       # Feature modules
│           │   ├── Auth/       # Login, Signup, Biometrics
│           │   ├── Payments/   # StoreKit 2, Paywall
│           │   ├── Home/       # Home screen
│           │   ├── Profile/    # User profile
│           │   ├── Settings/   # App settings
│           │   └── Onboarding/ # First-run experience
│           └── Core/           # Shared utilities
│               ├── Theme/      # Colors, Typography, Spacing
│               ├── Network/    # API client
│               ├── Storage/    # UserDefaults, Keychain
│               └── Analytics/  # Event tracking
│
├── packages/
│   ├── shared/                 # Shared types and schemas
│   │   └── src/
│   │       ├── types/          # TypeScript interfaces
│   │       ├── schemas/        # Zod validation schemas
│   │       └── constants/      # Shared constants
│   │
│   └── config/                 # Shared configurations
│       ├── typescript/         # TypeScript config
│       └── eslint/             # ESLint config
│
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # pnpm workspaces
└── package.json                # Root package.json
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+
- [Xcode](https://developer.apple.com/xcode/) 15+ (for iOS development)
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (for API deployment)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd swift-starter-kit

# Install dependencies
pnpm install
```

### Development

**API Development:**

```bash
# Start the API server locally
pnpm dev:api

# The API will be available at http://localhost:8787
```

**iOS Development:**

```bash
# Open in Xcode
open apps/ios/SwiftStarter.xcodeproj

# Or use Swift Package Manager
cd apps/ios
swift build
```

## Commands

```bash
# Development
pnpm dev           # Start all apps
pnpm dev:api       # Start API only

# Build
pnpm build         # Build all packages

# Quality
pnpm lint          # Run ESLint
pnpm typecheck     # Run TypeScript checks
pnpm format        # Format code with Prettier
pnpm format:check  # Check formatting

# Database
pnpm db:generate   # Generate Drizzle migrations
pnpm db:push       # Push schema to database

# Deployment
pnpm deploy        # Deploy all apps
```

## API Endpoints

```
GET  /              # API info
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

## iOS Features

- **StoreKit 2** - Native in-app purchases (no third-party SDK fees)
- **Biometric Auth** - Face ID / Touch ID integration
- **Design System** - Consistent theme with Colors, Typography, Spacing
- **API Client** - Type-safe networking with async/await
- **Secure Storage** - Keychain for sensitive data, UserDefaults for preferences

## Deployment

### API (Cloudflare Workers)

```bash
# Deploy to Cloudflare
cd apps/api
pnpm deploy

# Or via root
pnpm deploy --filter=@starter/api
```

### iOS App

1. Open `apps/ios/SwiftStarter.xcodeproj` in Xcode
2. Configure signing in Xcode (Signing & Capabilities)
3. Archive and upload to App Store Connect
4. Submit for review

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Cloudflare
CLOUDFLARE_API_TOKEN=your-token

# API
JWT_SECRET=your-secret-key

# iOS (configure in Xcode)
API_URL=https://your-worker.workers.dev
```

## GitHub Actions

The repository includes CI/CD workflows:

- **CI** (`ci.yml`) - Runs on PRs and pushes to main
  - Lint, type check, test
  - Build all packages
  - Deploy API to Cloudflare (on main)

- **Release** (`release.yml`) - Runs on GitHub releases
  - Deploy production API

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint && pnpm typecheck`
4. Submit a pull request

## License

MIT
