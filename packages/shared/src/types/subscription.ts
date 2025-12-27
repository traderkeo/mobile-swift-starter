export type SubscriptionPlatform = 'ios' | 'web';
export type SubscriptionStatusType =
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'trial'
  | 'pending';

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  platform: SubscriptionPlatform;
  status: SubscriptionStatusType;
  originalTransactionId: string | null;
  stripeSubscriptionId: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionStatus {
  isPremium: boolean;
  subscription: Subscription | null;
  expiresAt: Date | null;
}

export interface Receipt {
  id: string;
  userId: string;
  transactionId: string;
  productId: string;
  purchaseDate: Date;
  expiresDate: Date | null;
  environment: 'sandbox' | 'production';
  rawReceipt: string | null;
  createdAt: Date;
}

export interface VerifyReceiptRequest {
  receiptData: string;
  productId: string;
}

export interface VerifyReceiptResponse {
  valid: boolean;
  productId: string;
  expiresAt: Date | null;
  transactionId: string;
  environment: 'sandbox' | 'production';
}
