import { http } from "msw";

export const notificationsHandlers = [
  // GET /notifications (NOTIF-001/002/003)
  http.get("*/notifications", async ({ request }) => {}),

  // POST /notifications/:notificationId/read
  http.post(
    "*/notifications/:notificationId/read",
    async ({ request, params }) => {},
  ),
];
