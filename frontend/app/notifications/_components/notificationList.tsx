"use client";

import { useMemo } from "react";
import { BellOff } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { Notification } from "@/types/api";
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
      <p role="alert" className="p-4 text-sm text-destructive">
        {String(error)}
      </p>
    );
  }

  if (newestFirst.length === 0) {
    return (
      <Empty className="w-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BellOff />
          </EmptyMedia>
          <EmptyTitle>Aucune notification</EmptyTitle>
          <EmptyDescription>
            Vous serez informé ici des événements qui vous concernent.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="w-full">
      {newestFirst.map((notification) => (
        <li
          key={notification.id}
          className="w-full border-b border-border last:border-b-0"
        >
          <NotificationItem notification={notification} onRead={onRead} />
        </li>
      ))}
    </ul>
  );
}