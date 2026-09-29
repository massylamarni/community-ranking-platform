import { request } from "@/lib/http";
import type { Notification } from "@/types/api";

export const notificationsRepository = {
  list() {
    return request<Notification[]>("/notifications");
  },

  markAsRead(notificationId: string) {
    return request<void>(`/notifications/${notificationId}/read`, {
      method: "POST",
    });
  },
};
