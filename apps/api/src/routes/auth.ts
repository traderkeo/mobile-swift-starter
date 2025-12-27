import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env, Variables } from '../types/env';
import { createDb } from '../db';
import { AuthService } from '../services/auth.service';
import {
  loginSchema,
  signupSchema,
  appleLoginSchema,
  refreshTokenSchema,
} from '@starter/shared';
import { authRateLimiter } from '../middleware/rate-limit';
import { authMiddleware } from '../middleware/auth';

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// Apply rate limiting to auth routes
auth.use('/*', authRateLimiter);

// Register
auth.post('/register', zValidator('json', signupSchema), async (c) => {
  const { email, password, name } = c.req.valid('json');
  const db = createDb(c.env.DB);
  const authService = new AuthService(
    db,
    c.env.JWT_SECRET,
    c.env.JWT_REFRESH_SECRET
  );

  const result = await authService.register(email, password, name);

  return c.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresAt: result.tokens.expiresAt,
    },
  });
});

// Login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const db = createDb(c.env.DB);
  const authService = new AuthService(
    db,
    c.env.JWT_SECRET,
    c.env.JWT_REFRESH_SECRET
  );

  const result = await authService.login(email, password);

  return c.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresAt: result.tokens.expiresAt,
    },
  });
});

// Apple Sign In
auth.post('/login/apple', zValidator('json', appleLoginSchema), async (c) => {
  const { identityToken, user, email, fullName } = c.req.valid('json');
  const db = createDb(c.env.DB);
  const authService = new AuthService(
    db,
    c.env.JWT_SECRET,
    c.env.JWT_REFRESH_SECRET
  );

  // TODO: Verify identityToken with Apple
  // For now, we trust the token and extract the user ID
  // In production, you should verify the token with Apple's servers

  const appleUserId = user || identityToken.split('.')[1]; // Simplified - use proper JWT parsing
  const name = fullName
    ? [fullName.givenName, fullName.familyName].filter(Boolean).join(' ')
    : null;

  const result = await authService.loginWithApple(appleUserId, email, name);

  return c.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresAt: result.tokens.expiresAt,
    },
  });
});

// Refresh token
auth.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');
  const db = createDb(c.env.DB);
  const authService = new AuthService(
    db,
    c.env.JWT_SECRET,
    c.env.JWT_REFRESH_SECRET
  );

  const tokens = await authService.refreshTokens(refreshToken);

  return c.json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    },
  });
});

// Logout
auth.post('/logout', authMiddleware, async (c) => {
  const refreshToken = c.req.header('X-Refresh-Token');

  if (refreshToken) {
    const db = createDb(c.env.DB);
    const authService = new AuthService(
      db,
      c.env.JWT_SECRET,
      c.env.JWT_REFRESH_SECRET
    );
    await authService.logout(refreshToken);
  }

  return c.json({ success: true });
});

// Logout all sessions
auth.post('/logout/all', authMiddleware, async (c) => {
  const userId = c.get('userId')!;
  const db = createDb(c.env.DB);
  const authService = new AuthService(
    db,
    c.env.JWT_SECRET,
    c.env.JWT_REFRESH_SECRET
  );

  await authService.logoutAll(userId);

  return c.json({ success: true });
});

export { auth };
