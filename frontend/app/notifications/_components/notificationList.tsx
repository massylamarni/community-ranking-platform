"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemGroup } from "@/components/ui/item";
import type { Notification } from "@/types/api";
import NoNotification from "./noNotification";
import { NotificationError } from "./notificationError";
import { NotificationItem } from "./notificationItem";

export function NotificationList({
  notifications,
  loading,
  error,
  onRead,
}: {
  notifications: Notification[];
  loading: boolean;
  error: unknown;
  onRead: (id: number) => void;
}) {
  const newestFirst = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <NotificationError error={error} />
      </div>
    );
  }

  if (newestFirst.length === 0) return <NoNotification />;

  return (
    <ItemGroup className="gap-0 overflow-hidden">
      {newestFirst.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onRead}
        />
      ))}
    </ItemGroup>
  );
}