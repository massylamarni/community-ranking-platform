"use client";

import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/contexts/notificationsContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { NotificationError } from "./notificationError";
import { NotificationList } from "./notificationList";

const MAX_BADGE_COUNT = 9;

export function NotificationBell() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    actionError,
    refresh,
    markAsRead,
    markAllAsRead,
    clearActionError,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      clearActionError();
      void refresh();
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
      <PopoverContent
        align="end"
        className="w-80 max-w-[calc(100vw-1rem)] gap-0 overflow-hidden p-0"
      >
        <div className="flex min-w-0 items-center justify-between gap-2 px-4 py-3">
          <Label>Notifications</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-w-0 shrink"
            disabled={unreadCount === 0}
            onClick={() => void markAllAsRead()}
          >
            <CheckCheck className="size-4" />
            Tout marquer comme lu
          </Button>
        </div>
        <Separator />
        <div className="min-w-0 max-h-80 overflow-x-hidden overflow-y-auto">
          <NotificationList
            notifications={notifications}
            loading={loading}
            error={error}
            onRead={markAsRead}
          />
        </div>
        {actionError ? (
          <div className="p-2">
            <NotificationError error={actionError} />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}