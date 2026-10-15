import { Megaphone, ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/api";

const TYPE_CONFIG: Record<
  NotificationType,
  { label: string; icon: LucideIcon }
> = {
  MODERATION: { label: "Modération", icon: ShieldCheck },
  SYSTEM: { label: "Système", icon: Megaphone },
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
}

export function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: number) => void;
}) {
  const { label, icon: Icon } =
    TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.SYSTEM;

const content = (
  <>
    <div
      className={cn(
        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
        notification.read
          ? "bg-muted text-muted-foreground"
          : "bg-primary/10 text-primary",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>

        <time
          dateTime={notification.createdAt}
          className="text-xs text-muted-foreground"
        >
          {formatDate(notification.createdAt)}
        </time>
      </div>

      <p
        className={cn(
          "mt-1 break-words text-sm leading-6",
          !notification.read && "font-medium text-foreground",
        )}
      >
        {notification.message}
      </p>
    </div>

    {!notification.read && (
      <span
        role="img"
        aria-label="Non lue"
        className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
      />
    )}
  </>
);

const base = "flex w-full items-start gap-4 px-5 py-4 text-left transition-colors";
  // Unread notifications are clickable (click = mark as read).
  return notification.read ? (
    <div className={base}>{content}</div>
  ) : (
    <button
      type="button"
      onClick={() => onRead(notification.id)}
      className={cn(
        base,
        "bg-primary/[0.03] hover:bg-muted/70",
      )}
    >
      {content}
    </button>
  );
}