export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface AppleLoginRequest {
  identityToken: string;
  authorizationCode: string;
  user: string | null;
  email: string | null;
  fullName: {
    givenName: string | null;
    familyName: string | null;
  } | null;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
}
