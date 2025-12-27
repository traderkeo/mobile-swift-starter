export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  appleUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  isPremium: boolean;
  subscriptionExpiresAt: Date | null;
}
