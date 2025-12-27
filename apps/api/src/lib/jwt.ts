import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

interface TokenPayload extends JWTPayload {
  sub: string;
  email: string;
}

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export async function createAccessToken(
  payload: { userId: string; email: string },
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);

  return new SignJWT({ sub: payload.userId, email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secretKey);
}

export async function createRefreshToken(
  payload: { userId: string; email: string },
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);

  return new SignJWT({ sub: payload.userId, email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(secretKey);
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<TokenPayload> {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);

  const { payload } = await jwtVerify(token, secretKey);
  return payload as TokenPayload;
}

export function getTokenExpiry(expiresIn: string): Date {
  const now = new Date();
  const match = expiresIn.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error('Invalid expiry format');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      now.setSeconds(now.getSeconds() + value);
      break;
    case 'm':
      now.setMinutes(now.getMinutes() + value);
      break;
    case 'h':
      now.setHours(now.getHours() + value);
      break;
    case 'd':
      now.setDate(now.getDate() + value);
      break;
  }

  return now;
}

export function getRefreshTokenExpiry(): Date {
  return getTokenExpiry(REFRESH_TOKEN_EXPIRY);
}
