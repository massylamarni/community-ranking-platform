import { delay, http, HttpResponse } from "msw";
import { db } from "../db";
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
    const name = body.name?.trim() ?? "";
    if (!name || name.length > 50) {
      return errorResponse(422, "Échec de la validation", {
        name: "Le nom de catégorie doit contenir entre 1 et 50 caractères.",
      });
    }
    if (
      db.categories.some(
        (category) => category.name.toLowerCase() === name.toLowerCase(),
      )
    )
      return errorResponse(409, "Cette catégorie existe déjà.");
    const category = {
      id: db.generateNumericId("cat"),
      name,
    };
    db.categories.push(category);
    return HttpResponse.json(category, { status: 201 });
  }),

  // GET /categories/:id
  http.get("*/categories/:id", async ({ params }) => {
    await delay(60);
    const categoryId = Number(params.id);
    const category = db.categories.find((item) => item.id === categoryId);
    if (!category) return notFound("Catégorie introuvable.");
    return HttpResponse.json(db.serializeCategoryEntity(category));
  }),

  // PUT /categories/:id
  http.put("*/categories/:id", async ({ request, params }) => {
    await delay(120);
    const user = currentUserFrom(request);
    if (!user || user.role !== "admin")
      return forbidden("Vous n'avez pas les droits nécessaires.");
    const categoryId = Number(params.id);
    const category = db.categories.find((item) => item.id === categoryId);
    if (!category) return notFound("Catégorie introuvable.");
    const body = (await request.json()) as CreateCategoryPayload;
    const name = body.name?.trim() ?? "";
    if (!name || name.length > 50) {
      return errorResponse(422, "Échec de la validation", {
        name: "Le nom de catégorie doit contenir entre 1 et 50 caractères.",
      });
    }
    if (
      db.categories.some(
        (item) =>
          item.id !== categoryId &&
          item.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      return errorResponse(409, "Cette catégorie existe déjà.");
    }
    category.name = name;
    return HttpResponse.json(db.serializeCategoryEntity(category));
  }),

  // GET /categories/name/:name
  http.get("*/categories/name/:name", async ({ params }) => {
    await delay(60);
    const category = db.categories.find((item) => item.name === params.name);
    if (!category) return notFound("Catégorie introuvable.");
    return HttpResponse.json(db.serializeCategoryEntity(category));
  }),

  // DELETE /categories/:categoryId (CAT-002/ADM-001) - admin
  http.delete("*/categories/:categoryId", async ({ request, params }) => {
    await delay(120);
    const user = currentUserFrom(request);
    if (!user || user.role !== "admin")
      return forbidden("Vous n'avez pas les droits nécessaires.");
    const categoryId = Number(params.categoryId);
    const index = db.categories.findIndex((c) => c.id === categoryId);
    if (index === -1) return notFound("Catégorie introuvable.");
    db.categories.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /categories/:categoryId/works (CAT-005) - public, paginated
  http.get("*/categories/:categoryId/works", async ({ request, params }) => {
    await delay(80);
    const categoryId = Number(params.categoryId);
    const category = db.categories.find((c) => c.id === categoryId);
    if (!category) return notFound("Catégorie introuvable.");
    const url = new URL(request.url);
    const page = Math.max(0, Number(url.searchParams.get("page") ?? 0));
    const size = Math.max(1, Number(url.searchParams.get("size") ?? 20));
    const works = db
      .publicWorksOfCategory(category.id)
      .map((work) => db.serializeCategoryWorkEntity(work));
    const start = page * size;
    const content = works.slice(start, start + size);
    return HttpResponse.json({
      content,
      pageable: { pageNumber: page, pageSize: size },
      totalPages: Math.ceil(works.length / size),
      totalElements: works.length,
      last: start + size >= works.length,
      size,
      number: page,
      sort: { sorted: false, unsorted: true, empty: true },
      numberOfElements: content.length,
      first: page === 0,
      empty: content.length === 0,
    });
  }),
];
