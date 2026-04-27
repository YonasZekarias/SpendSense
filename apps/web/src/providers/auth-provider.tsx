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
  refreshAccessToken,
  register,
  resetPassword,
} from "@/actions/auth";
import {
  getAuthErrorStatus,
  type LoginPayload,
  type RegisterPayload,
  type UserProfile,
} from "@/lib/auth-types";
import {
  clearAuthCookies,
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
  setTokenPairCookies,
  setAccessTokenCookie,
} from "@/lib/auth-client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: UserProfile | null;
  accessToken: string | null;
  signIn: (payload: LoginPayload) => Promise<UserProfile>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (uid: string, token: string, newPassword: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const resetSession = useCallback(() => {
    clearAuthCookies();
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const refreshSession = useCallback(async (token: string): Promise<string> => {
    const refreshed = await refreshAccessToken(token);
    setAccessTokenCookie(refreshed.access);
    setAccessToken(refreshed.access);
    return refreshed.access;
  }, []);

  const hydrateCurrentUser = useCallback(async (token: string): Promise<UserProfile> => {
    const currentUser = await getCurrentUser(token);
    setUser(currentUser);
    setStatus("authenticated");
    return currentUser;
  }, []);

  useEffect(() => {
    const boot = async () => {
      const access = getAccessTokenFromCookie();
      const refresh = getRefreshTokenFromCookie();

      if (!access && !refresh) {
        setStatus("unauthenticated");
        return;
      }

      try {
        if (access) {
          setAccessToken(access);
          await hydrateCurrentUser(access);
          return;
        }

        if (!refresh) {
          resetSession();
          return;
        }

        const nextAccess = await refreshSession(refresh);
        await hydrateCurrentUser(nextAccess);
      } catch (error) {
        if (getAuthErrorStatus(error) === 401 && refresh) {
          try {
            const nextAccess = await refreshSession(refresh);
            await hydrateCurrentUser(nextAccess);
            return;
          } catch {
            resetSession();
            return;
          }
        }

        resetSession();
      }
    };

    void boot();
  }, [hydrateCurrentUser, refreshSession, resetSession]);

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      const tokenPair = await login(payload);
      setTokenPairCookies(tokenPair);
      setAccessToken(tokenPair.access);
      return hydrateCurrentUser(tokenPair.access);
    },
    [hydrateCurrentUser],
  );

  const signUp = useCallback(async (payload: RegisterPayload) => {
    await register(payload);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await forgotPassword(email);
  }, []);

  const confirmPasswordReset = useCallback(async (uid: string, token: string, newPassword: string) => {
    await resetPassword({ uid, token, new_password: newPassword });
  }, []);

  const signOut = useCallback(async () => {
    const access = getAccessTokenFromCookie();
    if (access) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/auth/logout/`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
          },
        );
      } catch {
        // best-effort
      }
    }
    resetSession();
  }, [resetSession]);

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
