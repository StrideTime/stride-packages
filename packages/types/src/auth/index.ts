/**
 * Authentication interfaces for provider-agnostic auth system
 */

import type { User } from "../entities";

export interface SignInCredentials {
 email: string;
 password: string;
}

export type OAuthProvider = "google" | "github";

export type AuthEventType =
 | "INITIAL_SESSION"
 | "SIGNED_IN"
 | "SIGNED_OUT"
 | "PASSWORD_RECOVERY"
 | "TOKEN_REFRESHED"
 | "USER_UPDATED";

export interface AuthSession {
 user: User; // Use existing User type from entities
 accessToken: string;
 refreshToken?: string;
 expiresAt?: Date;
}

export interface AuthProvider {
 signIn(credentials: SignInCredentials): Promise<AuthSession>;
 signUp(credentials: SignInCredentials, metadata?: any): Promise<AuthSession>;
 signInWithOAuth(provider: OAuthProvider): Promise<void>;
 signOut(): Promise<void>;
 getCurrentSession(): Promise<AuthSession | null>;
 refreshSession(): Promise<AuthSession | null>;
 onAuthChange(
  callback: (session: AuthSession | null, event: AuthEventType) => void,
 ): () => void;
 resetPasswordForEmail(
  email: string,
  options?: { redirectTo?: string },
 ): Promise<{ error?: Error }>;
 updateUser(attributes: { password?: string }): Promise<{ error?: Error }>;
}
