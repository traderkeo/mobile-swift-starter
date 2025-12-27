import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env, Variables } from '../types/env';
import { createDb } from '../db';
import { UserService } from '../services/user.service';
import { authMiddleware } from '../middleware/auth';
import { updateProfileSchema, changePasswordSchema } from '@starter/shared';

const users = new Hono<{ Bindings: Env; Variables: Variables }>();

// All user routes require authentication
users.use('/*', authMiddleware);

// Get current user profile
users.get('/me', async (c) => {
  const userId = c.get('userId')!;
  const db = createDb(c.env.DB);
  const userService = new UserService(db);

  const profile = await userService.getProfile(userId);

  return c.json({
    success: true,
    data: profile,
  });
});

// Update profile
users.patch('/me', zValidator('json', updateProfileSchema), async (c) => {
  const userId = c.get('userId')!;
  const data = c.req.valid('json');
  const db = createDb(c.env.DB);
  const userService = new UserService(db);

  const profile = await userService.updateProfile(userId, data);

  return c.json({
    success: true,
    data: profile,
  });
});

// Change password
users.post(
  '/me/change-password',
  zValidator('json', changePasswordSchema),
  async (c) => {
    const userId = c.get('userId')!;
    const { currentPassword, newPassword } = c.req.valid('json');
    const db = createDb(c.env.DB);
    const userService = new UserService(db);

    await userService.changePassword(userId, currentPassword, newPassword);

    return c.json({
      success: true,
      message: 'Password changed successfully',
    });
  }
);

// Delete account
users.delete('/me', async (c) => {
  const userId = c.get('userId')!;
  const db = createDb(c.env.DB);
  const userService = new UserService(db);

  await userService.deleteAccount(userId);

  return c.json({
    success: true,
    message: 'Account deleted successfully',
  });
});

export { users };
