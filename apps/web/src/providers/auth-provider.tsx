"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  forgotPassword,
  getCurrentUser,
  login,
  register,
  resetPassword,
} from "@/actions/auth";
import {
  type LoginPayload,
  type RegisterPayload,
  type UserProfile,
} from "@/lib/auth-types";
import {
  clearAccessTokenCookie,
  getAccessTokenFromCookie,
  setAccessTokenCookie,
} from "@/lib/auth-client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: UserProfile | null;
  accessToken: string | null;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const hydrateCurrentUser = useCallback(async (token: string) => {
    const currentUser = await getCurrentUser(token);
    setUser(currentUser);
    setStatus("authenticated");
  }, []);

  useEffect(() => {
    const boot = async () => {
      const token = getAccessTokenFromCookie();

      if (!token) {
        setStatus("unauthenticated");
        return;
      }

      setAccessToken(token);

      try {
        await hydrateCurrentUser(token);
      } catch {
        clearAccessTokenCookie();
        setAccessToken(null);
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    void boot();
  }, [hydrateCurrentUser]);

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      const tokenPair = await login(payload);
      setAccessTokenCookie(tokenPair.access);
      setAccessToken(tokenPair.access);
      await hydrateCurrentUser(tokenPair.access);
    },
    [hydrateCurrentUser],
  );

  const signUp = useCallback(async (payload: RegisterPayload) => {
    await register(payload);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await forgotPassword(email);
  }, []);

  const confirmPasswordReset = useCallback(async (token: string, newPassword: string) => {
    await resetPassword({ token, new_password: newPassword });
  }, []);

  const signOut = useCallback(() => {
    clearAccessTokenCookie();
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      signIn,
      signUp,
      requestPasswordReset,
      confirmPasswordReset,
      signOut,
    }),
    [
      accessToken,
      confirmPasswordReset,
      requestPasswordReset,
      signIn,
      signOut,
      signUp,
      status,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
