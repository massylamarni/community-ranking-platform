import { http } from "msw";

export const rankingsHandlers = [
  // GET /rankings (CLAS-001/002/003-005/011/012)
  http.get("*/rankings", async ({ request }) => {}),

  // GET /rankings/archive (CLAS-007)
  http.get("*/rankings/archive", async ({ request }) => {}),
];
