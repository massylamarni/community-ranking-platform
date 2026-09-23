import { http } from "msw";

export const commentsHandlers = [
  // GET /works/:workId/comments (COM-010/OEU-017) - public, paginated, replies nested
  http.get("*/works/:workId/comments", async ({ request, params }) => {}),

  // POST /works/:workId/comments (COM-001/004/009) - multipart/form-data
  http.post("*/works/:workId/comments", async ({ request, params }) => {}),

  // PATCH /comments/:commentId (COM-002) - author
  http.patch("*/comments/:commentId", async ({ request, params }) => {}),

  // DELETE /comments/:commentId (COM-003/011/ADM-003) - author or admin
  http.delete("*/comments/:commentId", async ({ request, params }) => {}),
];
