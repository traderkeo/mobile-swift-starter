import { HTTPException } from 'hono/http-exception';
import { ErrorCodes, ErrorMessages, type ErrorCode } from '@starter/shared';

export class ApiError extends HTTPException {
  code: ErrorCode;

  constructor(
    status: number,
    code: ErrorCode,
    message?: string,
    options?: { cause?: unknown }
  ) {
    super(status, {
      message: message || ErrorMessages[code],
      cause: options?.cause,
    });
    this.code = code;
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

// Common error factories
export const Errors = {
  badRequest: (code: ErrorCode = ErrorCodes.BAD_REQUEST, message?: string) =>
    new ApiError(400, code, message),

  unauthorized: (
    code: ErrorCode = ErrorCodes.INVALID_TOKEN,
    message?: string
  ) => new ApiError(401, code, message),

  forbidden: (code: ErrorCode = ErrorCodes.FORBIDDEN, message?: string) =>
    new ApiError(403, code, message),

  notFound: (code: ErrorCode = ErrorCodes.NOT_FOUND, message?: string) =>
    new ApiError(404, code, message),

  conflict: (
    code: ErrorCode = ErrorCodes.EMAIL_ALREADY_EXISTS,
    message?: string
  ) => new ApiError(409, code, message),

  tooManyRequests: (
    code: ErrorCode = ErrorCodes.RATE_LIMITED,
    message?: string
  ) => new ApiError(429, code, message),

  internal: (code: ErrorCode = ErrorCodes.INTERNAL_ERROR, message?: string) =>
    new ApiError(500, code, message),
};
