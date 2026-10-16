import { Megaphone, ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
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
  const unread = !notification.read;

  return (
    <Item
      variant={unread ? "muted" : "default"}
      render={unread ? <button type="button" /> : undefined}
      onClick={unread ? () => onRead(notification.id) : undefined}
      className={cn(
        "rounded-none border-0 border-b border-border text-left last:border-b-0",
        unread && "cursor-pointer hover:bg-muted",
      )}
    >
      <ItemMedia
        variant="icon"
        className={unread ? "text-primary" : "text-muted-foreground"}
      >
        <Icon aria-hidden="true" />
      </ItemMedia>

      <ItemContent className="min-w-0">
        <ItemTitle>
          {label}
          <time
            dateTime={notification.createdAt}
            className="text-xs font-normal text-muted-foreground"
          >
            {formatDate(notification.createdAt)}
          </time>
        </ItemTitle>

        <ItemDescription
          className={cn(
            "line-clamp-none break-words",
            unread && "font-medium text-foreground",
          )}
        >
          {notification.message}
        </ItemDescription>
      </ItemContent>

      {unread && (
        <ItemActions>
          <Badge variant="secondary">Non lue</Badge>
        </ItemActions>
      )}
    </Item>
  );
}