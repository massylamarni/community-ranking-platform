"use client";

import { CheckCheck, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/contexts/notificationsContext";
import LoadingGuard from "@/components/guards/loadingGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ButtonGroup } from "@/components/ui/button-group";
import { NotificationError } from "./_components/notificationError";
import { NotificationList } from "./_components/notificationList";

export default function NotificationsPage() {
  const { user, userLoading } = useAuth();
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

  if (userLoading) return <LoadingGuard />;
  if (!user) return null;

  function handleRefresh() {
    clearActionError();
    void refresh();
  }

  return (
    <Card className="w-full max-w-5xl overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle>
          Toutes les notifications
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>

        <CardDescription>
          Cliquez sur une notification non lue pour la marquer comme lue.
        </CardDescription>

        <CardAction>
          <ButtonGroup>
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
              onClick={() => void markAllAsRead()}
            >
              <CheckCheck />
              Tout marquer comme lu
            </Button>
          </ButtonGroup>
        </CardAction>
      </CardHeader>

      <CardContent className="w-full max-w-none p-0">
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
          onRead={markAsRead}
        />
      </CardContent>
    </Card>
  );
}