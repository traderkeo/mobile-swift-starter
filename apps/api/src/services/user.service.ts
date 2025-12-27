import { eq } from 'drizzle-orm';
import type { Database } from '../db';
import { users, sessions, subscriptions, type User } from '../db/schema';
import { hashPassword, verifyPassword } from '../lib/hash';
import { Errors } from '../lib/errors';
import { ErrorCodes } from '@starter/shared';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  isPremium: boolean;
  subscriptionExpiresAt: Date | null;
  createdAt: Date;
}

export class UserService {
  constructor(private db: Database) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw Errors.notFound(ErrorCodes.USER_NOT_FOUND);
    }

    // Get active subscription
    const subscription = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });

    const isPremium =
      subscription?.status === 'active' &&
      (!subscription.expiresAt || subscription.expiresAt > new Date());

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isPremium,
      subscriptionExpiresAt: subscription?.expiresAt || null,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(
    userId: string,
    data: { name?: string; avatarUrl?: string | null }
  ): Promise<UserProfile> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw Errors.notFound(ErrorCodes.USER_NOT_FOUND);
    }

    await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return this.getProfile(userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw Errors.notFound(ErrorCodes.USER_NOT_FOUND);
    }

    if (!user.passwordHash) {
      throw Errors.badRequest(
        ErrorCodes.BAD_REQUEST,
        'Password change not available for social logins'
      );
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw Errors.unauthorized(ErrorCodes.INVALID_CREDENTIALS);
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    await this.db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Invalidate all sessions except current
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw Errors.notFound(ErrorCodes.USER_NOT_FOUND);
    }

    // Delete user (cascades to sessions, subscriptions, receipts)
    await this.db.delete(users).where(eq(users.id, userId));
  }
}
