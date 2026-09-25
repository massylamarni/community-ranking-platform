import { http } from "msw";

export const authHandlers = [
  // POST /auth/register (AUTH-001)
  http.post("*/auth/register", async ({ request }) => {}),

  // POST /auth/login (AUTH-002)
  http.post("*/auth/login", async ({ request }) => {}),

  // POST /auth/logout (AUTH-004)
  http.post("*/auth/logout", async ({ request }) => {}),

  // GET /auth/me
  http.get("*/auth/me", async ({ request }) => {}),

  // POST /auth/password/change (AUTH-005)
  http.post("*/auth/password/change", async ({ request }) => {}),

  // POST /auth/password/forgot (AUTH-005)
  http.post("*/auth/password/forgot", async ({ request }) => {}),

  // POST /auth/password/reset (AUTH-005)
  http.post("*/auth/password/reset", async ({ request }) => {}),

  // GET /profile (AUTH-007)
  http.get("*/profile", async ({ request }) => {}),

  // PATCH /profile (AUTH-007)
  http.patch("*/profile", async ({ request }) => {}),
];
