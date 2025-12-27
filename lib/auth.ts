/**
 * Local Authentication Service
 *
 * Simple local auth using AsyncStorage.
 * User credentials are stored on-device.
 *
 * For production apps requiring server-side auth,
 * you can integrate your own auth provider here.
 */

import { storage, secureStorage, STORAGE_KEYS, StoredUser } from './storage';
import { validatePassword, rateLimiter, formatLockoutTime } from './security';
import * as Crypto from 'expo-crypto';

/**
 * Session stored locally
 */
export interface LocalSession {
  userId: string;
  token: string;
  expiresAt: string;
}

/**
 * User credentials stored securely
 */
interface StoredCredentials {
  email: string;
  passwordHash: string;
}

const CREDENTIALS_KEY = 'auth:credentials';
const SESSION_KEY = 'auth:session';
const APPLE_USER_KEY = 'auth:apple_user';

/**
 * Generate a simple hash for password storage
 * Note: For production, consider using a proper password hashing library
 */
async function hashPassword(password: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + 'local-salt-key' // Simple salt
  );
  return digest;
}

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generate a session token
 */
async function generateSessionToken(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Local Auth Service
 */
export const localAuth = {
  /**
   * Sign up with email and password
   */
  async signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ user: StoredUser; session: LocalSession }> {
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors[0] || 'Password is too weak');
    }

    // Check if user already exists
    const existingCredentials = await secureStorage.get(CREDENTIALS_KEY);
    if (existingCredentials) {
      const creds = JSON.parse(existingCredentials) as StoredCredentials;
      if (creds.email.toLowerCase() === email.toLowerCase()) {
        throw new Error('An account with this email already exists');
      }
    }

    // Create user
    const userId = generateUserId();
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const user: StoredUser = {
      id: userId,
      email: email.toLowerCase(),
      fullName,
      createdAt: now,
    };

    const credentials: StoredCredentials = {
      email: email.toLowerCase(),
      passwordHash,
    };

    // Create session
    const session = await this.createSession(userId);

    // Store data
    await storage.set(STORAGE_KEYS.USER, user);
    await secureStorage.set(CREDENTIALS_KEY, JSON.stringify(credentials));
    await secureStorage.set(SESSION_KEY, JSON.stringify(session));

    return { user, session };
  },

  /**
   * Sign in with email and password
   */
  async signIn(
    email: string,
    password: string
  ): Promise<{ user: StoredUser; session: LocalSession }> {
    const rateLimitKey = `login:${email.toLowerCase()}`;

    // Check rate limit
    const rateCheck = await rateLimiter.check(rateLimitKey);
    if (!rateCheck.allowed) {
      const waitTime = formatLockoutTime(rateCheck.retryAfterMs || 0);
      throw new Error(`Too many login attempts. Please try again in ${waitTime}.`);
    }

    // Get stored credentials
    const credentialsJson = await secureStorage.get(CREDENTIALS_KEY);
    if (!credentialsJson) {
      await rateLimiter.recordFailure(rateLimitKey);
      throw new Error('No account found. Please sign up first.');
    }

    const credentials = JSON.parse(credentialsJson) as StoredCredentials;

    // Verify email
    if (credentials.email.toLowerCase() !== email.toLowerCase()) {
      await rateLimiter.recordFailure(rateLimitKey);
      throw new Error('Invalid email or password');
    }

    // Verify password
    const passwordHash = await hashPassword(password);
    if (credentials.passwordHash !== passwordHash) {
      const result = await rateLimiter.recordFailure(rateLimitKey);
      if (result.remainingAttempts > 0) {
        throw new Error(
          `Invalid email or password. ${result.remainingAttempts} attempts remaining.`
        );
      } else {
        const waitTime = formatLockoutTime(30 * 60 * 1000);
        throw new Error(`Too many failed attempts. Account locked for ${waitTime}.`);
      }
    }

    // Success - clear rate limit
    await rateLimiter.recordSuccess(rateLimitKey);

    // Get user
    const user = await storage.get<StoredUser>(STORAGE_KEYS.USER);
    if (!user) {
      throw new Error('User data not found');
    }

    // Create new session
    const session = await this.createSession(user.id);
    await secureStorage.set(SESSION_KEY, JSON.stringify(session));

    return { user, session };
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    await secureStorage.remove(SESSION_KEY);
  },

  /**
   * Get current session
   */
  async getSession(): Promise<LocalSession | null> {
    const sessionJson = await secureStorage.get(SESSION_KEY);
    if (!sessionJson) return null;

    const session = JSON.parse(sessionJson) as LocalSession;

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      await secureStorage.remove(SESSION_KEY);
      return null;
    }

    return session;
  },

  /**
   * Get current user
   */
  async getUser(): Promise<StoredUser | null> {
    const session = await this.getSession();
    if (!session) return null;

    return storage.get<StoredUser>(STORAGE_KEYS.USER);
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: { fullName?: string; avatarUrl?: string }): Promise<StoredUser> {
    const user = await storage.get<StoredUser>(STORAGE_KEYS.USER);
    if (!user) {
      throw new Error('No user logged in');
    }

    const updatedUser: StoredUser = {
      ...user,
      ...updates,
    };

    await storage.set(STORAGE_KEYS.USER, updatedUser);
    return updatedUser;
  },

  /**
   * Delete account and all local data
   */
  async deleteAccount(): Promise<void> {
    await storage.clear();
    await secureStorage.remove(CREDENTIALS_KEY);
    await secureStorage.remove(SESSION_KEY);
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  },

  /**
   * Create a new session
   */
  async createSession(userId: string): Promise<LocalSession> {
    const token = await generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    return {
      userId,
      token,
      expiresAt,
    };
  },

  /**
   * Refresh session (extend expiration)
   */
  async refreshSession(): Promise<LocalSession | null> {
    const session = await this.getSession();
    if (!session) return null;

    const newSession = await this.createSession(session.userId);
    await secureStorage.set(SESSION_KEY, JSON.stringify(newSession));

    return newSession;
  },

  /**
   * Sign in with Apple
   */
  async signInWithApple(appleCredential: {
    user: string;
    email: string | null;
    fullName: { givenName: string | null; familyName: string | null } | null;
  }): Promise<{ user: StoredUser; session: LocalSession }> {
    // Check if this Apple user already exists
    const existingAppleUser = await secureStorage.get(APPLE_USER_KEY);
    const now = new Date().toISOString();

    let user: StoredUser;

    if (existingAppleUser) {
      const stored = JSON.parse(existingAppleUser) as { appleUserId: string; localUserId: string };
      if (stored.appleUserId === appleCredential.user) {
        // Existing user - get stored user data
        const storedUser = await storage.get<StoredUser>(STORAGE_KEYS.USER);
        if (storedUser) {
          user = storedUser;
        } else {
          // Recreate user data if missing
          user = {
            id: stored.localUserId,
            email:
              appleCredential.email ||
              `apple_${appleCredential.user.substring(0, 8)}@private.apple`,
            fullName: appleCredential.fullName
              ? `${appleCredential.fullName.givenName || ''} ${appleCredential.fullName.familyName || ''}`.trim() ||
                undefined
              : undefined,
            createdAt: now,
          };
          await storage.set(STORAGE_KEYS.USER, user);
        }
      } else {
        throw new Error('A different Apple account is already linked to this device');
      }
    } else {
      // New Apple user
      const userId = generateUserId();

      user = {
        id: userId,
        email:
          appleCredential.email || `apple_${appleCredential.user.substring(0, 8)}@private.apple`,
        fullName: appleCredential.fullName
          ? `${appleCredential.fullName.givenName || ''} ${appleCredential.fullName.familyName || ''}`.trim() ||
            undefined
          : undefined,
        createdAt: now,
      };

      // Store Apple user mapping
      await secureStorage.set(
        APPLE_USER_KEY,
        JSON.stringify({ appleUserId: appleCredential.user, localUserId: userId })
      );
      await storage.set(STORAGE_KEYS.USER, user);
    }

    // Create session
    const session = await this.createSession(user.id);
    await secureStorage.set(SESSION_KEY, JSON.stringify(session));

    return { user, session };
  },
};
