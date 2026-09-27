import { delay, http, HttpResponse } from "msw";
import { currentUserFrom, notFound, unauthorized } from "../utils";
import { db } from "../db";

export const notificationsHandlers = [
  // GET /notifications (NOTIF-001/002/003)
  http.get("*/notifications", async ({ request }) => {
    await delay(80);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    const mine = db.notifications
      .filter((n) => n.userId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return HttpResponse.json(mine);
  }),

  // POST /notifications/:notificationId/read
  http.post(
    "*/notifications/:notificationId/read",
    async ({ request, params }) => {
      await delay(60);
      const user = currentUserFrom(request);
      if (!user) return unauthorized();
      const notification = db.notifications.find(
        (n) => n.id === params.notificationId && n.userId === user.id,
      );
      if (!notification) return notFound("Notification introuvable.");
      notification.read = true;
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
