import { request } from "@/lib/http";
import type { Notification } from "@/types/api";

export const notificationsRepository = {
  list() {
    return request<Notification[]>("/notifications");
  },

  markAsRead(notificationId: number) {
    return request<void>(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  },

  markAllAsRead() {
    return request<void>("/notifications/read-all", { method: "PATCH" });
  },
};