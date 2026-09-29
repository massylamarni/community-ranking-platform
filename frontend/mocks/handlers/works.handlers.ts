import { delay, http, HttpResponse } from "msw";
import {
  currentUserFrom,
  errorResponse,
  forbidden,
  imageUrlFromForm,
  notFound,
  unauthorized,
} from "../utils";
import type {
  CreateWorkPayload,
  SubmitWorkPayload,
  UpdateWorkPayload,
} from "@/types/api";
import { db, DbWork } from "../db";

function workResponse(work: DbWork) {
  return db.serializeWorkResponse(work);
}

export const worksHandlers = [
  // GET /works
  http.get("*/works", async ({ request }) => {
    await delay(80);
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const categoryId = url.searchParams.get("categoryId");
    const title = url.searchParams.get("title")?.toLowerCase();
    const works = db.works.filter((work) => {
      if (status && work.status !== status) return false;
      if (categoryId && !work.categoryIds.includes(Number(categoryId))) {
        return false;
      }
      if (title && !work.title.toLowerCase().includes(title)) return false;
      return true;
    });
    return HttpResponse.json(works.map(workResponse));
  }),

  // POST /works: create a draft, optionally with an image.
  http.post("*/works", async ({ request }) => {
    await delay(200);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();

    let payload: CreateWorkPayload;
    let imageUrl: string | null = null;
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await request.formData();
      payload = {
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        imageUrl: String(form.get("imageUrl") ?? "") || null,
      };
      imageUrl = imageUrlFromForm(form) ?? payload.imageUrl ?? null;
    } else {
      payload = (await request.json()) as CreateWorkPayload;
      imageUrl = payload.imageUrl ?? null;
    }

    const title = payload.title?.trim() ?? "";
    const description = payload.description?.trim() ?? "";

    const fields: Record<string, string> = {};
    if (!title) fields.title = "Le titre est requis.";
    else if (title.length > 150) fields.title = "150 caractères maximum.";
    if (!description) fields.description = "La description est requise.";
    if (Object.keys(fields).length > 0)
      return errorResponse(422, "Échec de la validation", fields);

    const work: DbWork = {
      id: db.generateId("work"),
      title,
      description,
      imageUrl,
      authorId: user.id,
      categoryIds: [],
      status: "created",
      votes: [],
      createdAt: new Date().toISOString(),
    };
    db.works.push(work);
    return HttpResponse.json(workResponse(work), { status: 201 });
  }),

  // GET /works/:workId
  http.get("*/works/:workId", async ({ request, params }) => {
    await delay(80);
    const work = db.findWorkByApiId(params.workId);
    if (!work) return notFound("Œuvre introuvable.");
    const viewer = currentUserFrom(request);
    if (!db.isWorkVisibleTo(work, viewer))
      return notFound("Œuvre introuvable.");
    return HttpResponse.json(workResponse(work));
  }),

  // PATCH /works/:workId: update title/description on an editable draft.
  http.patch("*/works/:workId", async ({ request, params }) => {
    await delay(150);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    const work = db.findWorkByApiId(params.workId);
    if (!work) return notFound("Œuvre introuvable.");
    if (work.authorId !== user.id)
      return forbidden("Seul l'auteur peut modifier cette œuvre.");
    if (work.status !== "created" && work.status !== "rejected") {
      return errorResponse(400, "Cette œuvre ne peut pas être modifiée.");
    }
    const payload = (await request.json()) as UpdateWorkPayload;
    const fields: Record<string, string> = {};
    if (payload.title != null) {
      const title = payload.title.trim();
      if (!title) fields.title = "Le titre est requis.";
      else if (title.length > 150) fields.title = "150 caractères maximum.";
      else work.title = title;
    }
    if (payload.description != null) {
      const description = payload.description.trim();
      if (!description) fields.description = "La description est requise.";
      else work.description = description;
    }
    if (Object.keys(fields).length > 0)
      return errorResponse(422, "Échec de la validation", fields);
    if (work.status === "rejected") work.status = "created";
    return HttpResponse.json(workResponse(work));
  }),

  // POST /works/:workId/image
  http.post("*/works/:workId/image", async ({ request, params }) => {
    await delay(150);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    const work = db.findWorkByApiId(params.workId);
    if (!work) return notFound("Œuvre introuvable.");
    if (work.authorId !== user.id)
      return forbidden("Seul l'auteur peut modifier cette œuvre.");
    const form = await request.formData();
    const image = form.get("image");
    if (!(image instanceof File) || image.size === 0) {
      return errorResponse(400, "Un fichier image est requis.");
    }
    work.imageUrl = imageUrlFromForm(form);
    return HttpResponse.json(workResponse(work));
  }),

  // POST /works/:workId/submit
  http.post("*/works/:workId/submit", async ({ request, params }) => {
    await delay(150);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    const work = db.findWorkByApiId(params.workId);
    if (!work) return notFound("Œuvre introuvable.");
    if (work.authorId !== user.id)
      return forbidden("Seul l'auteur peut publier cette œuvre.");
    if (work.status !== "created") {
      return errorResponse(400, "Cette œuvre ne peut pas être publiée.");
    }
    const payload = (await request.json()) as SubmitWorkPayload;
    const categoryIds = payload.categoryIds ?? [];
    if (
      categoryIds.length === 0 ||
      categoryIds.some(
        (id) => !db.categories.some((category) => category.id === id),
      )
    ) {
      return errorResponse(422, "Échec de la validation", {
        categoryIds: "Sélectionnez au moins une catégorie valide.",
      });
    }
    work.categoryIds = categoryIds;
    work.status = "pending";
    return HttpResponse.json(workResponse(work));
  }),

  // DELETE /works/:workId
  http.delete("*/works/:workId", async ({ request, params }) => {
    await delay(120);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    const work = db.findWorkByApiId(params.workId);
    const index = work ? db.works.indexOf(work) : -1;
    if (!work || index === -1) return notFound("Œuvre introuvable.");
    if (work.authorId !== user.id && user.role !== "admin") {
      return forbidden("Vous n'avez pas les droits nécessaires.");
    }
    db.works.splice(index, 1);
    // Cascade
    for (let i = db.comments.length - 1; i >= 0; i -= 1) {
      if (db.comments[i].workId === work.id) db.comments.splice(i, 1);
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
