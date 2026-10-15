"use client";

import { useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/contexts/notificationsContext";
import LoadingGuard from "@/components/guards/loadingGuard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NotificationList } from "./_components/notificationList";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default function NotificationsPage() {
  const { user, userLoading } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [actionError, setActionError] = useState<unknown>(null);

  if (userLoading) {
    return <LoadingGuard />;
  }

  if (!user) {
    return null;
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

  function handleRefresh() {
    setActionError(null);
    void refresh();
  }

  return (
    <main className="w-full max-w-5xl">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bell className="size-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground">
              Retrouvez ici les événements importants de votre compte.
            </p>
          </div>
        </div>
      </div>

      <Card className="w-full overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
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
                onClick={() => {
                  void handleReadAll();
                }}
              >
                <CheckCheck />
                Tout marquer comme lu
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="w-full p-0">
          {actionError !== null && (
            <Alert variant="destructive" className="m-4">
              <AlertTitle>
                Impossible de modifier la notification
              </AlertTitle>
              <AlertDescription>
                {getErrorMessage(actionError)}
              </AlertDescription>
            </Alert>
          )}

          <NotificationList
            notifications={notifications}
            loading={loading}
            error={error}
            onRead={(id) => {
              void handleRead(id);
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}