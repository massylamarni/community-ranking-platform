import { http } from "msw";

export const worksHandlers = [
  // POST /works (OEU-001..006) - multipart/form-data
  http.post("*/works", async ({ request }) => {}),

  // GET /works/:workId (OEU-015/016)
  http.get("*/works/:workId", async ({ request, params }) => {}),

  // PATCH /works/:workId (OEU-012/013) - author
  http.patch("*/works/:workId", async ({ request, params }) => {}),

  // DELETE /works/:workId (OEU-014/ADM-002) - author or admin
  http.delete("*/works/:workId", async ({ request, params }) => {}),
];
