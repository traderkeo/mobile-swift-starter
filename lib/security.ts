/**
 * Security Utilities
 *
 * Password validation, rate limiting, and security helpers.
 */

import { storage } from './storage';

// ============================================
// PASSWORD VALIDATION
// ============================================

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-4 (weak to strong)
  errors: string[];
  suggestions: string[];
}

export interface PasswordRequirements {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  minScore?: number;
}

const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  minScore: 2,
};

// Common weak passwords to reject
const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  '12345678',
  '123456789',
  'qwerty',
  'qwerty123',
  'abc123',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
  'master',
  'admin',
  'login',
  'passw0rd',
  'p@ssword',
  'p@ssw0rd',
  'password!',
  'pass1234',
]);

/**
 * Validate password strength
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  const req = { ...DEFAULT_REQUIREMENTS, ...requirements };

  // Check length
  if (password.length < (req.minLength || 8)) {
    errors.push(`Password must be at least ${req.minLength} characters`);
  } else {
    score += 1;
  }

  if (req.maxLength && password.length > req.maxLength) {
    errors.push(`Password must be less than ${req.maxLength} characters`);
  }

  // Check for uppercase
  const hasUppercase = /[A-Z]/.test(password);
  if (req.requireUppercase && !hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (hasUppercase) {
    score += 0.5;
  } else {
    suggestions.push('Add uppercase letters for stronger security');
  }

  // Check for lowercase
  const hasLowercase = /[a-z]/.test(password);
  if (req.requireLowercase && !hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (hasLowercase) {
    score += 0.5;
  }

  // Check for numbers
  const hasNumbers = /[0-9]/.test(password);
  if (req.requireNumbers && !hasNumbers) {
    errors.push('Password must contain at least one number');
  } else if (hasNumbers) {
    score += 0.5;
  } else {
    suggestions.push('Add numbers for stronger security');
  }

  // Check for special characters
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (req.requireSpecialChars && !hasSpecialChars) {
    errors.push('Password must contain at least one special character');
  } else if (hasSpecialChars) {
    score += 0.5;
  } else {
    suggestions.push('Add special characters (!@#$%) for stronger security');
  }

  // Bonus for length
  if (password.length >= 12) score += 0.5;
  if (password.length >= 16) score += 0.5;

  // Check for common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password.');
    score = 0;
  }

  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Avoid repeating characters');
    score = Math.max(0, score - 0.5);
  }

  // Check for sequential numbers or letters
  if (/(?:abc|bcd|cde|123|234|345|456|567|678|789)/i.test(password)) {
    suggestions.push('Avoid sequential characters');
    score = Math.max(0, score - 0.5);
  }

  // Cap score at 4
  score = Math.min(4, Math.round(score));

  const isValid = errors.length === 0 && score >= (req.minScore || 2);

  return {
    isValid,
    score,
    errors,
    suggestions: isValid ? suggestions : [],
  };
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Strong';
    case 4:
      return 'Very Strong';
    default:
      return 'Unknown';
  }
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
      return '#ef4444'; // red
    case 1:
      return '#f97316'; // orange
    case 2:
      return '#eab308'; // yellow
    case 3:
      return '#22c55e'; // green
    case 4:
      return '#16a34a'; // dark green
    default:
      return '#9ca3af'; // gray
  }
}

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const RATE_LIMIT_KEY = 'security:rate_limit';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
  lockoutMs: number; // Lockout duration after max attempts
  key: string; // Unique key for this rate limit (e.g., 'login:email@example.com')
}

const DEFAULT_LOGIN_CONFIG: Omit<RateLimitConfig, 'key'> = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
};

/**
 * Rate limiter for preventing brute force attacks
 */
export const rateLimiter = {
  /**
   * Check if an action is rate limited
   */
  async check(
    key: string,
    config: Partial<Omit<RateLimitConfig, 'key'>> = {}
  ): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    lockedUntil?: Date;
    retryAfterMs?: number;
  }> {
    const cfg = { ...DEFAULT_LOGIN_CONFIG, ...config, key };
    const entries = await this.getEntries();
    const entry = entries[key];
    const now = Date.now();

    // No entry = allowed
    if (!entry) {
      return { allowed: true, remainingAttempts: cfg.maxAttempts };
    }

    // Check if locked out
    if (entry.lockedUntil && entry.lockedUntil > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: new Date(entry.lockedUntil),
        retryAfterMs: entry.lockedUntil - now,
      };
    }

    // Check if window has expired (reset counter)
    if (now - entry.firstAttempt > cfg.windowMs) {
      await this.reset(key);
      return { allowed: true, remainingAttempts: cfg.maxAttempts };
    }

    // Check attempts
    const remaining = cfg.maxAttempts - entry.attempts;
    if (remaining <= 0) {
      // Lock out the user
      const lockedUntil = now + cfg.lockoutMs;
      entries[key] = { ...entry, lockedUntil };
      await this.saveEntries(entries);

      return {
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: new Date(lockedUntil),
        retryAfterMs: cfg.lockoutMs,
      };
    }

    return { allowed: true, remainingAttempts: remaining };
  },

  /**
   * Record a failed attempt
   */
  async recordFailure(
    key: string,
    config: Partial<Omit<RateLimitConfig, 'key'>> = {}
  ): Promise<{
    remainingAttempts: number;
    lockedUntil?: Date;
  }> {
    const cfg = { ...DEFAULT_LOGIN_CONFIG, ...config, key };
    const entries = await this.getEntries();
    const now = Date.now();
    const entry = entries[key];

    if (!entry || now - entry.firstAttempt > cfg.windowMs) {
      // New or expired entry
      entries[key] = {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
      };
    } else {
      // Increment attempts
      entries[key] = {
        ...entry,
        attempts: entry.attempts + 1,
        lastAttempt: now,
      };
    }

    await this.saveEntries(entries);

    const remaining = cfg.maxAttempts - entries[key].attempts;

    if (remaining <= 0) {
      const lockedUntil = now + cfg.lockoutMs;
      entries[key].lockedUntil = lockedUntil;
      await this.saveEntries(entries);

      return {
        remainingAttempts: 0,
        lockedUntil: new Date(lockedUntil),
      };
    }

    return { remainingAttempts: remaining };
  },

  /**
   * Record a successful attempt (clears rate limit)
   */
  async recordSuccess(key: string): Promise<void> {
    await this.reset(key);
  },

  /**
   * Reset rate limit for a key
   */
  async reset(key: string): Promise<void> {
    const entries = await this.getEntries();
    delete entries[key];
    await this.saveEntries(entries);
  },

  /**
   * Get all rate limit entries
   */
  async getEntries(): Promise<Record<string, RateLimitEntry>> {
    const data = await storage.get<Record<string, RateLimitEntry>>(RATE_LIMIT_KEY as never);
    return data || {};
  },

  /**
   * Save rate limit entries
   */
  async saveEntries(entries: Record<string, RateLimitEntry>): Promise<void> {
    await storage.set(RATE_LIMIT_KEY as never, entries);
  },

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<void> {
    const entries = await this.getEntries();
    const now = Date.now();
    const cleanedEntries: Record<string, RateLimitEntry> = {};

    for (const [key, entry] of Object.entries(entries)) {
      // Keep entries that are still within window or locked
      if (
        now - entry.firstAttempt < DEFAULT_LOGIN_CONFIG.windowMs ||
        (entry.lockedUntil && entry.lockedUntil > now)
      ) {
        cleanedEntries[key] = entry;
      }
    }

    await this.saveEntries(cleanedEntries);
  },
};

// ============================================
// SESSION SECURITY
// ============================================

/**
 * Check if session should be refreshed
 * Returns true if session is older than the specified threshold
 */
export function shouldRefreshSession(
  expiresAt: string | Date,
  refreshThresholdMs: number = 7 * 24 * 60 * 60 * 1000 // 7 days before expiry
): boolean {
  const expiry = new Date(expiresAt).getTime();
  const now = Date.now();
  const timeUntilExpiry = expiry - now;

  return timeUntilExpiry < refreshThresholdMs && timeUntilExpiry > 0;
}

/**
 * Format lockout time remaining for display
 */
export function formatLockoutTime(retryAfterMs: number): string {
  if (retryAfterMs < 60000) {
    return 'less than a minute';
  }

  const minutes = Math.ceil(retryAfterMs / 60000);

  if (minutes === 1) {
    return '1 minute';
  } else if (minutes < 60) {
    return `${minutes} minutes`;
  } else {
    const hours = Math.ceil(minutes / 60);
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
}
