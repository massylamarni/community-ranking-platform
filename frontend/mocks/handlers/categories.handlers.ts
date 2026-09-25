import { http } from "msw";

export const categoriesHandlers = [
  // GET /categories (CAT-003) - public
  http.get("*/categories", async () => {}),

  // POST /categories (CAT-001/ADM-001) - admin
  http.post("*/categories", async ({ request }) => {}),

  // DELETE /categories/:categoryId (CAT-002/ADM-001) - admin
  http.delete("*/categories/:categoryId", async ({ request, params }) => {}),

  // GET /categories/:categoryId/works (CAT-005) - public, paginated
  http.get("*/categories/:categoryId/works", async ({ request, params }) => {}),
];
