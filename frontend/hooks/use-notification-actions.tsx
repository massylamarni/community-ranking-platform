"use client";

import { useCallback, useState } from "react";
import { useNotifications } from "@/contexts/notificationsContext";

// Mark-as-read actions shared by the notification bell and the notifications
// page, with the error of the last action.
export function useNotificationActions() {
  const { markAsRead, markAllAsRead } = useNotifications();
  const [actionError, setActionError] = useState<unknown>(null);

  const read = useCallback(
    async (id: number) => {
      setActionError(null);
      try {
        await markAsRead(id);
      } catch (err) {
        setActionError(err);
      }
    },
    [markAsRead],
  );

  const readAll = useCallback(async () => {
    setActionError(null);
    try {
      await markAllAsRead();
    } catch (err) {
      setActionError(err);
    }
  }, [markAllAsRead]);

  const clearActionError = useCallback(() => setActionError(null), []);

  return { actionError, read, readAll, clearActionError };
}