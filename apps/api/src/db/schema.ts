import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash'),
    appleUserId: text('apple_user_id').unique(),
    name: text('name'),
    avatarUrl: text('avatar_url'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    appleUserIdIdx: index('users_apple_user_id_idx').on(table.appleUserId),
  })
);

// Sessions table for refresh tokens
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    refreshToken: text('refresh_token').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
    refreshTokenIdx: index('sessions_refresh_token_idx').on(table.refreshToken),
  })
);

// Subscriptions table
export const subscriptions = sqliteTable(
  'subscriptions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    productId: text('product_id').notNull(),
    platform: text('platform', { enum: ['ios', 'web'] }).notNull(),
    status: text('status', {
      enum: ['active', 'expired', 'cancelled', 'trial', 'pending'],
    }).notNull(),
    originalTransactionId: text('original_transaction_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeCustomerId: text('stripe_customer_id'),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    cancelledAt: integer('cancelled_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
    originalTxIdx: index('subscriptions_original_tx_idx').on(
      table.originalTransactionId
    ),
    stripeSubIdx: index('subscriptions_stripe_sub_idx').on(
      table.stripeSubscriptionId
    ),
  })
);

// Receipts table for purchase verification records
export const receipts = sqliteTable(
  'receipts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    transactionId: text('transaction_id').unique().notNull(),
    originalTransactionId: text('original_transaction_id'),
    productId: text('product_id').notNull(),
    purchaseDate: integer('purchase_date', { mode: 'timestamp' }).notNull(),
    expiresDate: integer('expires_date', { mode: 'timestamp' }),
    environment: text('environment', {
      enum: ['sandbox', 'production'],
    }).notNull(),
    verificationStatus: text('verification_status', {
      enum: ['pending', 'verified', 'failed'],
    })
      .notNull()
      .default('pending'),
    rawReceipt: text('raw_receipt'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('receipts_user_id_idx').on(table.userId),
    transactionIdIdx: index('receipts_transaction_id_idx').on(
      table.transactionId
    ),
  })
);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Receipt = typeof receipts.$inferSelect;
export type NewReceipt = typeof receipts.$inferInsert;
