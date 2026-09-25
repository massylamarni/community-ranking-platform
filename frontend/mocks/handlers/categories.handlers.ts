import { delay, http, HttpResponse } from "msw";
import { db, paginate } from "../db";
import { currentUserFrom, errorResponse, forbidden, notFound } from "../utils";
import { CreateCategoryPayload } from "@/types/api";

export const categoriesHandlers = [
  // GET /categories (CAT-003) - public
  http.get("*/categories", async () => {
    await delay(60);
    return HttpResponse.json(db.categories);
  }),

  // POST /categories (CAT-001/ADM-001) - admin
  http.post("*/categories", async ({ request }) => {
    await delay(120);
    const user = currentUserFrom(request);
    if (!user || user.role !== "admin")
      return forbidden("Vous n'avez pas les droits nécessaires.");
    const body = (await request.json()) as CreateCategoryPayload;
    if (!body.name || body.name.trim().length === 0) {
      return errorResponse(422, "Échec de la validation", {
        name: "Le nom de la catégorie est requis.",
      });
    }
    const category = { id: db.generateId("cat"), name: body.name.trim() };
    db.categories.push(category);
    return HttpResponse.json(category, { status: 201 });
  }),

  // DELETE /categories/:categoryId (CAT-002/ADM-001) - admin
  http.delete("*/categories/:categoryId", async ({ request, params }) => {
    await delay(120);
    const user = currentUserFrom(request);
    if (!user || user.role !== "admin")
      return forbidden("Vous n'avez pas les droits nécessaires.");
    const index = db.categories.findIndex((c) => c.id === params.categoryId);
    if (index === -1) return notFound("Catégorie introuvable.");
    db.categories.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /categories/:categoryId/works (CAT-005) - public, paginated
  http.get("*/categories/:categoryId/works", async ({ request, params }) => {
    await delay(80);
    const category = db.categories.find((c) => c.id === params.categoryId);
    if (!category) return notFound("Catégorie introuvable.");
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
    const viewer = currentUserFrom(request);
    const works = db
      .publicWorksOfCategory(category.id)
      .map((w) => db.serializeWork(w, viewer));
    return HttpResponse.json(paginate(works, page, pageSize));
  }),
];
