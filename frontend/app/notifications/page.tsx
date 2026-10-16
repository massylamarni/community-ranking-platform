"use client";

import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNotificationActions } from "@/hooks/use-notification-actions";
import { useNotifications } from "@/contexts/notificationsContext";
import LoadingGuard from "@/components/guards/loadingGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NotificationError } from "./_components/notificationError";
import { NotificationList } from "./_components/notificationList";

export default function NotificationsPage() {
  const { user, userLoading } = useAuth();
  const { notifications, unreadCount, loading, error, refresh } =
    useNotifications();
  const { actionError, read, readAll, clearActionError } =
    useNotificationActions();

  if (userLoading) return <LoadingGuard />;
  if (!user) return null;

  function handleRefresh() {
    clearActionError();
    void refresh();
  }

  return (
    <Card className="w-full max-w-5xl overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 text-primary" />
              Toutes les notifications
              {unreadCount > 0 && (
                <Badge variant="secondary">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>

            <CardDescription>
              Cliquez sur une notification non lue pour la marquer comme lue.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={handleRefresh}
            >
              <RefreshCw />
              Actualiser
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || unreadCount === 0}
              onClick={() => void readAll()}
            >
              <CheckCheck />
              Tout marquer comme lu
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="w-full p-0">
        {actionError !== null && (
          <div className="m-4">
            <NotificationError
              error={actionError}
              title="Impossible de modifier la notification"
            />
          </div>
        )}

        <NotificationList
          notifications={notifications}
          loading={loading}
          error={error}
          onRead={read}
        />
      </CardContent>
    </Card>
  );
}