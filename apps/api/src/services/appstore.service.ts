import { SignJWT, importPKCS8 } from 'jose';
import { Errors } from '../lib/errors';
import { ErrorCodes } from '@starter/shared';

/**
 * App Store Server API Service
 * Handles receipt validation and transaction verification using Apple's App Store Server API
 * https://developer.apple.com/documentation/appstoreserverapi
 */

interface AppStoreConfig {
  keyId: string; // Your App Store Connect API Key ID
  issuerId: string; // Your App Store Connect Issuer ID
  bundleId: string; // Your app's bundle ID
  privateKey: string; // Your private key (.p8 file contents)
  environment: 'sandbox' | 'production';
}

interface TransactionInfo {
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  purchaseDate: Date;
  expiresDate: Date | null;
  type: 'Auto-Renewable Subscription' | 'Non-Consumable' | 'Consumable' | 'Non-Renewing Subscription';
  inAppOwnershipType: 'PURCHASED' | 'FAMILY_SHARED';
  signedDate: Date;
  environment: 'Sandbox' | 'Production';
  revocationDate: Date | null;
  revocationReason: number | null;
  isUpgraded: boolean;
  offerType: number | null;
  offerIdentifier: string | null;
}

interface SubscriptionStatus {
  bundleId: string;
  subscriptionGroupIdentifier: string;
  lastTransactions: {
    originalTransactionId: string;
    status: number; // 1 = active, 2 = expired, 3 = billing retry, 4 = grace period, 5 = revoked
    signedTransactionInfo: string;
    signedRenewalInfo: string;
  }[];
}

interface RenewalInfo {
  autoRenewProductId: string;
  autoRenewStatus: number; // 0 = off, 1 = on
  expirationIntent: number | null;
  gracePeriodExpiresDate: Date | null;
  isInBillingRetryPeriod: boolean;
  offerIdentifier: string | null;
  offerType: number | null;
  originalTransactionId: string;
  priceIncreaseStatus: number | null;
  productId: string;
  recentSubscriptionStartDate: Date;
  renewalDate: Date | null;
  signedDate: Date;
}

export class AppStoreService {
  private config: AppStoreConfig;
  private baseUrl: string;

  constructor(config: AppStoreConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === 'production'
        ? 'https://api.storekit.itunes.apple.com'
        : 'https://api.storekit-sandbox.itunes.apple.com';
  }

  /**
   * Generate a JWT token for App Store Server API authentication
   */
  private async generateToken(): Promise<string> {
    const privateKey = await importPKCS8(this.config.privateKey, 'ES256');

    const token = await new SignJWT({})
      .setProtectedHeader({
        alg: 'ES256',
        kid: this.config.keyId,
        typ: 'JWT',
      })
      .setIssuer(this.config.issuerId)
      .setIssuedAt()
      .setExpirationTime('1h')
      .setAudience('appstoreconnect-v1')
      .setSubject(this.config.bundleId)
      .sign(privateKey);

    return token;
  }

  /**
   * Make an authenticated request to the App Store Server API
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' = 'GET',
    body?: unknown
  ): Promise<T> {
    const token = await this.generateToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('App Store API error:', error);

      if (response.status === 404) {
        throw Errors.notFound(ErrorCodes.SUBSCRIPTION_NOT_FOUND);
      }

      throw Errors.badRequest(
        ErrorCodes.INVALID_RECEIPT,
        'Failed to verify with App Store'
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Decode a signed transaction (JWS) from Apple
   */
  private decodeSignedTransaction(signedTransaction: string): TransactionInfo {
    // The signedTransaction is a JWS (JSON Web Signature)
    // For production, you should verify the signature using Apple's certificates
    // For now, we just decode the payload

    const parts = signedTransaction.split('.');
    if (parts.length !== 3) {
      throw Errors.badRequest(ErrorCodes.INVALID_RECEIPT, 'Invalid signed transaction format');
    }

    const payload = JSON.parse(atob(parts[1]));

    return {
      transactionId: payload.transactionId,
      originalTransactionId: payload.originalTransactionId,
      productId: payload.productId,
      purchaseDate: new Date(payload.purchaseDate),
      expiresDate: payload.expiresDate ? new Date(payload.expiresDate) : null,
      type: payload.type,
      inAppOwnershipType: payload.inAppOwnershipType,
      signedDate: new Date(payload.signedDate),
      environment: payload.environment,
      revocationDate: payload.revocationDate ? new Date(payload.revocationDate) : null,
      revocationReason: payload.revocationReason,
      isUpgraded: payload.isUpgraded || false,
      offerType: payload.offerType,
      offerIdentifier: payload.offerIdentifier,
    };
  }

  /**
   * Decode signed renewal info from Apple
   */
  private decodeSignedRenewalInfo(signedRenewalInfo: string): RenewalInfo {
    const parts = signedRenewalInfo.split('.');
    if (parts.length !== 3) {
      throw Errors.badRequest(ErrorCodes.INVALID_RECEIPT, 'Invalid signed renewal info format');
    }

    const payload = JSON.parse(atob(parts[1]));

    return {
      autoRenewProductId: payload.autoRenewProductId,
      autoRenewStatus: payload.autoRenewStatus,
      expirationIntent: payload.expirationIntent,
      gracePeriodExpiresDate: payload.gracePeriodExpiresDate
        ? new Date(payload.gracePeriodExpiresDate)
        : null,
      isInBillingRetryPeriod: payload.isInBillingRetryPeriod || false,
      offerIdentifier: payload.offerIdentifier,
      offerType: payload.offerType,
      originalTransactionId: payload.originalTransactionId,
      priceIncreaseStatus: payload.priceIncreaseStatus,
      productId: payload.productId,
      recentSubscriptionStartDate: new Date(payload.recentSubscriptionStartDate),
      renewalDate: payload.renewalDate ? new Date(payload.renewalDate) : null,
      signedDate: new Date(payload.signedDate),
    };
  }

  /**
   * Get transaction info by transaction ID
   */
  async getTransactionInfo(transactionId: string): Promise<TransactionInfo> {
    const response = await this.makeRequest<{ signedTransactionInfo: string }>(
      `/inApps/v1/transactions/${transactionId}`
    );

    return this.decodeSignedTransaction(response.signedTransactionInfo);
  }

  /**
   * Get all subscriptions for a user by their original transaction ID
   */
  async getSubscriptionStatus(
    originalTransactionId: string
  ): Promise<{
    status: 'active' | 'expired' | 'billing_retry' | 'grace_period' | 'revoked';
    transaction: TransactionInfo;
    renewalInfo: RenewalInfo;
  } | null> {
    try {
      const response = await this.makeRequest<{
        bundleId: string;
        data: SubscriptionStatus[];
      }>(`/inApps/v1/subscriptions/${originalTransactionId}`);

      if (!response.data || response.data.length === 0) {
        return null;
      }

      // Get the first subscription group's latest transaction
      const subscriptionGroup = response.data[0];
      const latestTransaction = subscriptionGroup.lastTransactions[0];

      if (!latestTransaction) {
        return null;
      }

      const transaction = this.decodeSignedTransaction(
        latestTransaction.signedTransactionInfo
      );
      const renewalInfo = this.decodeSignedRenewalInfo(
        latestTransaction.signedRenewalInfo
      );

      // Map Apple's status codes to our status
      const statusMap: Record<number, 'active' | 'expired' | 'billing_retry' | 'grace_period' | 'revoked'> = {
        1: 'active',
        2: 'expired',
        3: 'billing_retry',
        4: 'grace_period',
        5: 'revoked',
      };

      return {
        status: statusMap[latestTransaction.status] || 'expired',
        transaction,
        renewalInfo,
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return null;
    }
  }

  /**
   * Get transaction history for a customer
   */
  async getTransactionHistory(
    originalTransactionId: string,
    revision?: string
  ): Promise<{
    transactions: TransactionInfo[];
    hasMore: boolean;
    revision: string;
  }> {
    let endpoint = `/inApps/v1/history/${originalTransactionId}`;
    if (revision) {
      endpoint += `?revision=${revision}`;
    }

    const response = await this.makeRequest<{
      signedTransactions: string[];
      hasMore: boolean;
      revision: string;
    }>(endpoint);

    return {
      transactions: response.signedTransactions.map((t) =>
        this.decodeSignedTransaction(t)
      ),
      hasMore: response.hasMore,
      revision: response.revision,
    };
  }

  /**
   * Look up order by order ID (from receipt)
   */
  async lookUpOrder(orderId: string): Promise<TransactionInfo[]> {
    const response = await this.makeRequest<{
      signedTransactions: string[];
    }>(`/inApps/v1/lookup/${orderId}`);

    return response.signedTransactions.map((t) =>
      this.decodeSignedTransaction(t)
    );
  }

  /**
   * Request a test notification (for testing webhooks)
   */
  async requestTestNotification(): Promise<string> {
    const response = await this.makeRequest<{ testNotificationToken: string }>(
      '/inApps/v1/notifications/test',
      'POST'
    );

    return response.testNotificationToken;
  }

  /**
   * Get refund history
   */
  async getRefundHistory(
    originalTransactionId: string,
    revision?: string
  ): Promise<{
    transactions: TransactionInfo[];
    hasMore: boolean;
    revision: string;
  }> {
    let endpoint = `/inApps/v2/refund/lookup/${originalTransactionId}`;
    if (revision) {
      endpoint += `?revision=${revision}`;
    }

    const response = await this.makeRequest<{
      signedTransactions: string[];
      hasMore: boolean;
      revision: string;
    }>(endpoint);

    return {
      transactions: response.signedTransactions.map((t) =>
        this.decodeSignedTransaction(t)
      ),
      hasMore: response.hasMore,
      revision: response.revision,
    };
  }

  /**
   * Extend a subscription (for customer service)
   */
  async extendSubscription(
    originalTransactionId: string,
    extendByDays: number,
    extendReasonCode: 0 | 1 | 2 | 3, // 0 = undeclared, 1 = customer satisfaction, 2 = other, 3 = service issue
    requestIdentifier: string
  ): Promise<void> {
    await this.makeRequest(
      `/inApps/v1/subscriptions/extend/${originalTransactionId}`,
      'PUT',
      {
        extendByDays,
        extendReasonCode,
        requestIdentifier,
      }
    );
  }
}

/**
 * Create an AppStoreService instance from environment variables
 */
export function createAppStoreService(env: {
  APPSTORE_KEY_ID?: string;
  APPSTORE_ISSUER_ID?: string;
  APPSTORE_BUNDLE_ID?: string;
  APPSTORE_PRIVATE_KEY?: string;
  APPSTORE_ENVIRONMENT?: string;
}): AppStoreService | null {
  if (
    !env.APPSTORE_KEY_ID ||
    !env.APPSTORE_ISSUER_ID ||
    !env.APPSTORE_BUNDLE_ID ||
    !env.APPSTORE_PRIVATE_KEY
  ) {
    console.warn('App Store Server API not configured - missing environment variables');
    return null;
  }

  return new AppStoreService({
    keyId: env.APPSTORE_KEY_ID,
    issuerId: env.APPSTORE_ISSUER_ID,
    bundleId: env.APPSTORE_BUNDLE_ID,
    privateKey: env.APPSTORE_PRIVATE_KEY,
    environment: (env.APPSTORE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  });
}
