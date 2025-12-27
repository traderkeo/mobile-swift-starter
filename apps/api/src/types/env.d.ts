export interface Env {
  // D1 Database
  DB: D1Database;

  // KV Namespace for caching
  CACHE: KVNamespace;

  // Environment variables
  ENVIRONMENT: 'development' | 'staging' | 'production';

  // Auth secrets
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;

  // Apple App Store Server API
  APPSTORE_KEY_ID?: string;
  APPSTORE_ISSUER_ID?: string;
  APPSTORE_BUNDLE_ID?: string;
  APPSTORE_PRIVATE_KEY?: string;
  APPSTORE_ENVIRONMENT?: 'sandbox' | 'production';

  // Stripe
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;

  // CORS
  ALLOWED_ORIGINS?: string;
}

export interface Variables {
  userId?: string;
  user?: {
    id: string;
    email: string;
  };
}
