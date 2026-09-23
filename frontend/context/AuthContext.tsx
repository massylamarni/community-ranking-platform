"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authRepository } from "@/repositories";
import { ApiError } from "@/lib/errors";
import type {
  CurrentUser,
  LoginUserPayload,
  RegisterUserPayload,
} from "@/types/api";

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  login(payload: LoginUserPayload): Promise<void>;
  register(payload: RegisterUserPayload): Promise<void>;
  logout(): Promise<void>;
  refresh(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await authRepository.me();
      setUser(me);
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) {
        setUser(null);
      } else {
        throw err;
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      await refresh();
      if (mounted) setLoading(false);
    };
    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [refresh]);

  const login = useCallback(
    async (payload: LoginUserPayload) => {
      await authRepository.login(payload);
      await refresh();
    },
    [refresh],
  );

  const register = useCallback(
    async (payload: RegisterUserPayload) => {
      await authRepository.register(payload);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await authRepository.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
}

export function isAdmin(user: CurrentUser | null): boolean {
  return user?.role === "admin";
}

export function isOwner(
  user: CurrentUser | null,
  ownerUsername: string,
): boolean {
  return !!user && user.username === ownerUsername;
}
