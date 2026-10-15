"use client";

import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/contexts/notificationsContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { NotificationList } from "./notificationList";

const MAX_BADGE_COUNT = 9;

export function NotificationBell() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);

  if (!user) return null;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setActionError(null);
      refresh();
    }
  }

  async function handleRead(id: number) {
    setActionError(null);
    try {
      await markAsRead(id);
    } catch (err) {
      setActionError(err);
    }
  }

  async function handleReadAll() {
    setActionError(null);
    try {
      await markAllAsRead();
    } catch (err) {
      setActionError(err);
    }
  }

  const badgeLabel =
    unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(unreadCount);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={
              unreadCount > 0
                ? `Notifications (${unreadCount} non lues)`
                : "Notifications"
            }
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
                {badgeLabel}
              </Badge>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 gap-0 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold">Notifications</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={unreadCount === 0}
            onClick={handleReadAll}
          >
            <CheckCheck className="size-4" />
            Tout marquer comme lu
          </Button>
        </div>
        <Separator />
        <div className="max-h-80 overflow-y-auto">
          <NotificationList
            notifications={notifications}
            loading={loading}
            error={error}
            onRead={handleRead}
          />
        </div>
        {actionError ? (
          <p role="alert" className="px-4 py-2 text-sm text-destructive">
            {String(actionError)}
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}