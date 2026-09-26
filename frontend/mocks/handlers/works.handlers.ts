import { delay, http, HttpResponse } from "msw";
import {
  currentUserFrom,
  errorResponse,
  forbidden,
  imageUrlFromForm,
  notFound,
  unauthorized,
} from "../utils";
import { db, DbWork } from "../db";
import { UpdateWorkPayload } from "@/types/api";

export const worksHandlers = [
  // POST /works (OEU-001..006) - multipart/form-data
  http.post("*/works", async ({ request }) => {
    await delay(200);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();

    const form = await request.formData();
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const categoryIds = form.getAll("categoryIds").map(String);

    const fields: Record<string, string> = {};
    if (!title) fields.title = "Le titre est requis.";
    if (!description) fields.description = "La description est requise.";
    if (categoryIds.length === 0)
      fields.categoryIds = "Au moins une catégorie est requise.";
    if (Object.keys(fields).length > 0)
      return errorResponse(422, "Échec de la validation", fields);

    const work: DbWork = {
      id: db.generateId("work"),
      title,
      description,
      imageUrl: imageUrlFromForm(form),
      authorId: user.id,
      categoryIds,
      status: "pending",
      votes: [],
      createdAt: new Date().toISOString(),
    };
    db.works.push(work);
    return HttpResponse.json(db.serializeWork(work, user), { status: 201 });
  }),

  // GET /works/:workId (OEU-015/016)
  http.get("*/works/:workId", async ({ request, params }) => {
    await delay(80);
    console.log(db.works);
    const work = db.works.find((w) => w.id === params.workId);
    if (!work) return notFound("Œuvre introuvable.");
    const viewer = currentUserFrom(request);
    if (!db.isWorkVisibleTo(work, viewer))
      return notFound("Œuvre introuvable.");
    return HttpResponse.json(db.serializeWork(work, viewer));
  }),

  // PATCH /works/:workId (OEU-012/013) - author
  http.patch("*/works/:workId", async ({ request, params }) => {
    await delay(150);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    const work = db.works.find((w) => w.id === params.workId);
    if (!work) return notFound("Œuvre introuvable.");
    if (work.authorId !== user.id)
      return forbidden("Seul l'auteur peut modifier cette œuvre.");

    const form = await request.formData();
    const title = form.has("title")
      ? String(form.get("title") ?? "").trim()
      : undefined;
    const description = form.has("description")
      ? String(form.get("description") ?? "").trim()
      : undefined;
    const categoryIds = form.has("categoryIds")
      ? form.getAll("categoryIds").map(String)
      : undefined;

    if (title !== undefined) {
      if (!title)
        return errorResponse(422, "Échec de la validation", {
          title: "Le titre est requis.",
        });
      work.title = title;
    }
    if (description !== undefined) {
      if (!description)
        return errorResponse(422, "Échec de la validation", {
          description: "La description est requise.",
        });
      work.description = description;
    }
    if (categoryIds !== undefined) {
      if (categoryIds.length === 0)
        return errorResponse(422, "Échec de la validation", {
          categoryIds: "Au moins une catégorie est requise.",
        });
      work.categoryIds = categoryIds;
    }

    const newImageUrl = imageUrlFromForm(form);
    if (newImageUrl) work.imageUrl = newImageUrl;

    work.status = "pending";
    return HttpResponse.json(db.serializeWork(work, user));
  }),

  // DELETE /works/:workId (OEU-014/ADM-002) - author or admin
  http.delete("*/works/:workId", async ({ request, params }) => {
    await delay(120);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    const index = db.works.findIndex((w) => w.id === params.workId);
    if (index === -1) return notFound("Œuvre introuvable.");
    const work = db.works[index];
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
