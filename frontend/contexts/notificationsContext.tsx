"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { notificationsRepository } from "@/repositories";
import { useAuth } from "@/hooks/use-auth";
import type { Notification } from "@/types/api";

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: unknown;
  actionError: unknown;
  refresh: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearActionError: () => void;
}

// The notifications are stored with the id of the user they belong to, so a
// previous user's notifications are never shown after a logout / login.
interface NotificationsState {
  userId: number;
  items: Notification[];
  error: unknown;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [state, setState] = useState<NotificationsState | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const load = useCallback(
    (id: number): Promise<NotificationsState> =>
      notificationsRepository
        .list()
        .then((items) => ({ userId: id, items, error: null }))
        .catch((error) => ({ userId: id, items: [], error })),
    [],
  );

  useEffect(() => {
    if (userId === null) return;
    let isCurrent = true;

    load(userId).then((next) => {
      if (isCurrent) setState(next);
    });

    return () => {
      isCurrent = false;
    };
  }, [userId, load]);

  const refresh = useCallback(async () => {
    if (userId === null) return;
    setState(await load(userId));
  }, [userId, load]);

  const markAsRead = useCallback(async (id: number) => {
    setActionError(null);

    try {
      await notificationsRepository.markAsRead(id);
      setState((prev) =>
        prev && {
          ...prev,
          items: prev.items.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification,
          ),
        },
      );
    } catch (error) {
      setActionError(error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setActionError(null);

    try {
      await notificationsRepository.markAllAsRead();
      setState((prev) =>
        prev && {
          ...prev,
          items: prev.items.map((notification) => ({
            ...notification,
            read: true,
          })),
        },
      );
    } catch (error) {
      setActionError(error);
    }
  }, []);

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const current = state && state.userId === userId ? state : null;
  const notifications = useMemo(() => current?.items ?? [], [current]);
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      loading: userId !== null && current === null,
      error: current?.error ?? null,
      actionError,
      refresh,
      markAsRead,
      markAllAsRead,
      clearActionError,
    }),
    [
      notifications,
      unreadCount,
      userId,
      current,
      actionError,
      refresh,
      markAsRead,
      markAllAsRead,
      clearActionError,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within a <NotificationsProvider>",
    );
  return ctx;
}