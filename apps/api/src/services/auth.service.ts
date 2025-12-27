import { eq } from 'drizzle-orm';
import type { Database } from '../db';
import { users, sessions, type User, type NewUser } from '../db/schema';
import { hashPassword, verifyPassword, generateId } from '../lib/hash';
import {
  createAccessToken,
  createRefreshToken,
  verifyToken,
  getRefreshTokenExpiry,
} from '../lib/jwt';
import { Errors } from '../lib/errors';
import { ErrorCodes } from '@starter/shared';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthResult {
  user: Pick<User, 'id' | 'email' | 'name'>;
  tokens: AuthTokens;
}

export class AuthService {
  constructor(
    private db: Database,
    private jwtSecret: string,
    private refreshSecret: string
  ) {}

  async register(
    email: string,
    password: string,
    name: string
  ): Promise<AuthResult> {
    // Check if user exists
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      throw Errors.conflict(ErrorCodes.EMAIL_ALREADY_EXISTS);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = generateId();
    const now = new Date();

    await this.db.insert(users).values({
      id: userId,
      email: email.toLowerCase(),
      passwordHash,
      name,
      createdAt: now,
      updatedAt: now,
    });

    // Generate tokens
    const tokens = await this.generateTokens(userId, email);

    // Create session
    await this.createSession(userId, tokens.refreshToken);

    return {
      user: { id: userId, email: email.toLowerCase(), name },
      tokens,
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    // Find user
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user || !user.passwordHash) {
      throw Errors.unauthorized(ErrorCodes.INVALID_CREDENTIALS);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      throw Errors.unauthorized(ErrorCodes.INVALID_CREDENTIALS);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Create session
    await this.createSession(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      tokens,
    };
  }

  async loginWithApple(
    appleUserId: string,
    email: string | null,
    name: string | null
  ): Promise<AuthResult> {
    // Check if user exists with this Apple ID
    let user = await this.db.query.users.findFirst({
      where: eq(users.appleUserId, appleUserId),
    });

    if (!user && email) {
      // Check if user exists with this email
      user = await this.db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });

      if (user) {
        // Link Apple ID to existing user
        await this.db
          .update(users)
          .set({ appleUserId, updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }
    }

    if (!user) {
      // Create new user
      if (!email) {
        throw Errors.badRequest(
          ErrorCodes.APPLE_AUTH_FAILED,
          'Email is required for new users'
        );
      }

      const userId = generateId();
      const now = new Date();

      await this.db.insert(users).values({
        id: userId,
        email: email.toLowerCase(),
        appleUserId,
        name,
        createdAt: now,
        updatedAt: now,
      });

      user = {
        id: userId,
        email: email.toLowerCase(),
        name,
        appleUserId,
        passwordHash: null,
        avatarUrl: null,
        createdAt: now,
        updatedAt: now,
      };
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Create session
    await this.createSession(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    let payload;
    try {
      payload = await verifyToken(refreshToken, this.refreshSecret);
    } catch {
      throw Errors.unauthorized(ErrorCodes.INVALID_TOKEN);
    }

    // Find session
    const session = await this.db.query.sessions.findFirst({
      where: eq(sessions.refreshToken, refreshToken),
    });

    if (!session || session.expiresAt < new Date()) {
      throw Errors.unauthorized(ErrorCodes.TOKEN_EXPIRED);
    }

    // Find user
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, payload.sub as string),
    });

    if (!user) {
      throw Errors.unauthorized(ErrorCodes.INVALID_TOKEN);
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Update session with new refresh token
    await this.db
      .update(sessions)
      .set({
        refreshToken: tokens.refreshToken,
        expiresAt: getRefreshTokenExpiry(),
      })
      .where(eq(sessions.id, session.id));

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.db
      .delete(sessions)
      .where(eq(sessions.refreshToken, refreshToken));
  }

  async logoutAll(userId: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }

  private async generateTokens(
    userId: string,
    email: string
  ): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken({ userId, email }, this.jwtSecret),
      createRefreshToken({ userId, email }, this.refreshSecret),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    };
  }

  private async createSession(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    const sessionId = generateId();
    await this.db.insert(sessions).values({
      id: sessionId,
      userId,
      refreshToken,
      expiresAt: getRefreshTokenExpiry(),
      createdAt: new Date(),
    });
  }
}
