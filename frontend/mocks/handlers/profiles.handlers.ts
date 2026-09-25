import { http } from "msw";

export const profilesHandlers = [
  // GET /users/:username (PROF-001/002/006)
  http.get("*/users/:username", async ({ params }) => {}),

  // GET /users/:username/activity (PROF-003)
  http.get("*/users/:username/activity", async ({ request, params }) => {}),
];
