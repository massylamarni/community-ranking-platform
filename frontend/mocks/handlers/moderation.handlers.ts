import { http } from "msw";

export const moderationHandlers = [
  // GET /moderation/works (ADM-004) - admin
  http.get("*/moderation/works", async ({ request }) => {}),

  // POST /moderation/works/:workId/accept (MOD-004/NOTIF-001) - admin
  http.post(
    "*/moderation/works/:workId/accept",
    async ({ request, params }) => {},
  ),

  // POST /moderation/works/:workId/refuse (MOD-005/NOTIF-002) - admin
  http.post(
    "*/moderation/works/:workId/refuse",
    async ({ request, params }) => {},
  ),
];
