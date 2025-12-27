import { cors } from 'hono/cors';

export const corsMiddleware = cors({
  origin: (origin) => {
    // Allow requests from these origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8787',
      'https://yourapp.com',
      'https://www.yourapp.com',
      'https://staging.yourapp.com',
    ];

    // Allow iOS app (no origin header)
    if (!origin) return '*';

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      return origin;
    }

    // Allow any subdomain of yourapp.com
    if (origin.endsWith('.yourapp.com')) {
      return origin;
    }

    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['X-Request-Id'],
  credentials: true,
  maxAge: 86400, // 24 hours
});
