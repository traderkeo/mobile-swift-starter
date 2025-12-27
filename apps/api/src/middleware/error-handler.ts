import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { Env, Variables } from '../types/env';
import { ApiError } from '../lib/errors';
import { ErrorCodes, ErrorMessages } from '@starter/shared';

/**
 * Global error handler for the API
 */
export function errorHandler(
  err: Error,
  c: Context<{ Bindings: Env; Variables: Variables }>
) {
  console.error('Error:', err);

  // Handle our custom API errors
  if (err instanceof ApiError) {
    return c.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      },
      err.status as 400 | 401 | 403 | 404 | 409 | 429 | 500
    );
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return c.json(
      {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Validation failed',
          details: errors,
        },
      },
      400
    );
  }

  // Handle Hono's HTTP exceptions
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: {
          code: 'HTTP_ERROR',
          message: err.message,
        },
      },
      err.status
    );
  }

  // Handle unknown errors
  return c.json(
    {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message:
          process.env.NODE_ENV === 'development'
            ? err.message
            : 'An unexpected error occurred',
      },
    },
    500
  );
}
