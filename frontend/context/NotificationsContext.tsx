"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { notificationsRepository } from "@/repositories";
import { useAuth } from "./AuthContext";
import type { Notification } from "@/types/api";

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh(): Promise<void>;
  markAsRead(notificationId: string): Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

/** Supports Jira ticket #58 (notification bell / list with unread indicator). */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const list = await notificationsRepository.list();
      setNotifications(list);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markAsRead = useCallback(async (notificationId: string) => {
    await notificationsRepository.markAsRead(notificationId);
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo<NotificationsContextValue>(
    () => ({ notifications, unreadCount, loading, refresh, markAsRead }),
    [notifications, unreadCount, loading, refresh, markAsRead]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within a <NotificationsProvider>");
  return ctx;
}
