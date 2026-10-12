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
  ChangePasswordPayload,
  CurrentUser,
  ForgotPasswordPayload,
  LoginUserPayload,
  OwnProfile,
  RegisterUserPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from "@/types/api";

interface AuthContextValue {
  user: CurrentUser | null;
  profile: OwnProfile | null;
  userLoading: boolean;
  profileLoading: boolean;
  login(payload: LoginUserPayload): Promise<CurrentUser | null>;
  register(payload: RegisterUserPayload): Promise<CurrentUser | null>;
  changePassword(payload: ChangePasswordPayload): Promise<void>;
  forgotPassword(payload: ForgotPasswordPayload): Promise<void>;
  resetPassword(payload: ResetPasswordPayload): Promise<void>;
  updateProfile(payload: UpdateProfilePayload): Promise<OwnProfile>;
  refreshProfile(): Promise<OwnProfile>;
  logout(): Promise<void>;
  refreshUser(): Promise<CurrentUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<OwnProfile | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const refreshUser = useCallback(async (): Promise<CurrentUser | null> => {
    try {
      const me = await authRepository.me();
      setUser(me);
      return me;
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) {
        setUser(null);
        return null;
      }
      throw err;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const data = await authRepository.getOwnProfile();
      setProfile(data);
      return data;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await refreshUser();
      } catch (err) {
        console.error("Failed to initialize auth", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setUserLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const login = useCallback(
    async (payload: LoginUserPayload) => {
      await authRepository.login(payload);
      return refreshUser();
    },
    [refreshUser],
  );

  const register = useCallback(
    async (payload: RegisterUserPayload) => {
      await authRepository.register(payload);
      return refreshUser();
    },
    [refreshUser],
  );

  const changePassword = useCallback(async (payload: ChangePasswordPayload) => {
    await authRepository.changePassword(payload);
  }, []);

  const forgotPassword = useCallback(async (payload: ForgotPasswordPayload) => {
    await authRepository.forgotPassword(payload);
  }, []);

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    await authRepository.resetPassword(payload);
  }, []);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      const updated = await authRepository.updateOwnProfile(payload);
      setProfile(updated);
      await refreshUser(); // keep CurrentUser in sync
      return updated;
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    try {
      await authRepository.logout();
    } finally {
      setUser(null);
      setProfile(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      userLoading,
      profileLoading,
      login,
      register,
      changePassword,
      forgotPassword,
      resetPassword,
      updateProfile,
      refreshProfile,
      logout,
      refreshUser,
    }),
    [
      user,
      profile,
      userLoading,
      profileLoading,
      login,
      register,
      changePassword,
      forgotPassword,
      resetPassword,
      updateProfile,
      refreshProfile,
      logout,
      refreshUser,
    ],
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
  ownerId: number | string | null | undefined,
): boolean {
  return !!user && ownerId != null && String(user.id) === String(ownerId);
}
