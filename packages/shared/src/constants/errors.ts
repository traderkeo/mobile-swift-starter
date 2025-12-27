/**
 * Error codes used across the application
 */
export const ErrorCodes = {
  // Auth errors
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_EXISTS',
  INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  APPLE_AUTH_FAILED: 'AUTH_APPLE_FAILED',
  WEAK_PASSWORD: 'AUTH_WEAK_PASSWORD',
  RATE_LIMITED: 'AUTH_RATE_LIMITED',

  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PROFILE_UPDATE_FAILED: 'USER_UPDATE_FAILED',

  // Subscription errors
  INVALID_RECEIPT: 'SUB_INVALID_RECEIPT',
  RECEIPT_ALREADY_USED: 'SUB_RECEIPT_USED',
  SUBSCRIPTION_EXPIRED: 'SUB_EXPIRED',
  SUBSCRIPTION_NOT_FOUND: 'SUB_NOT_FOUND',
  STRIPE_WEBHOOK_FAILED: 'SUB_STRIPE_WEBHOOK_FAILED',
  APPLE_WEBHOOK_FAILED: 'SUB_APPLE_WEBHOOK_FAILED',

  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  FORBIDDEN: 'FORBIDDEN',
  BAD_REQUEST: 'BAD_REQUEST',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Human-readable error messages
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCodes.EMAIL_ALREADY_EXISTS]: 'An account with this email already exists',
  [ErrorCodes.INVALID_TOKEN]: 'Invalid or malformed token',
  [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again',
  [ErrorCodes.APPLE_AUTH_FAILED]: 'Sign in with Apple failed. Please try again',
  [ErrorCodes.WEAK_PASSWORD]:
    'Password must be at least 8 characters with uppercase, lowercase, and numbers',
  [ErrorCodes.RATE_LIMITED]: 'Too many attempts. Please try again later',

  [ErrorCodes.USER_NOT_FOUND]: 'User not found',
  [ErrorCodes.PROFILE_UPDATE_FAILED]: 'Failed to update profile',

  [ErrorCodes.INVALID_RECEIPT]: 'Invalid purchase receipt',
  [ErrorCodes.RECEIPT_ALREADY_USED]: 'This receipt has already been used',
  [ErrorCodes.SUBSCRIPTION_EXPIRED]: 'Your subscription has expired',
  [ErrorCodes.SUBSCRIPTION_NOT_FOUND]: 'No active subscription found',
  [ErrorCodes.STRIPE_WEBHOOK_FAILED]: 'Failed to process payment webhook',
  [ErrorCodes.APPLE_WEBHOOK_FAILED]: 'Failed to process App Store notification',

  [ErrorCodes.VALIDATION_ERROR]: 'Invalid input data',
  [ErrorCodes.NOT_FOUND]: 'Resource not found',
  [ErrorCodes.INTERNAL_ERROR]: 'An unexpected error occurred',
  [ErrorCodes.FORBIDDEN]: 'You do not have permission to perform this action',
  [ErrorCodes.BAD_REQUEST]: 'Invalid request',
};
