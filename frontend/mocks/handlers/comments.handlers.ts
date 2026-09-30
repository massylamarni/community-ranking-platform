import { delay, http, HttpResponse } from "msw";
import { db, DbComment } from "../db";
import {
  currentUserFrom,
  errorResponse,
  forbidden,
  notFound,
  unauthorized,
} from "../utils";
import { UpdateCommentPayload } from "@/types/api";
import { imageUrlFromForm } from "./../utils";

export const commentsHandlers = [
  // GET /works/:workId/comments (COM-010/OEU-017) - public, paginated, replies nested
  http.get("*/works/:workId/comments", async ({ request, params }) => {
    await delay(80);
    const work = db.findWorkByApiId(params.workId);
    if (!work) return notFound("Œuvre introuvable.");
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
    const viewer = currentUserFrom(request);
    const topLevel = db
      .topLevelCommentsOf(work.id)
      .map((c) => db.serializeComment(c, viewer));
    const start = (page - 1) * pageSize;
    const items = topLevel.slice(start, start + pageSize);
    return HttpResponse.json({ items, page, pageSize, total: topLevel.length });
  }),

  // POST /works/:workId/comments (COM-001/004/009) - multipart/form-data
  http.post("*/works/:workId/comments", async ({ request, params }) => {
    await delay(150);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    const work = db.findWorkByApiId(params.workId);
    if (!work) return notFound("Œuvre introuvable.");

    const form = await request.formData();
    const content = String(form.get("content") ?? "").trim();
    const parentCommentId = form.get("parentCommentId")
      ? String(form.get("parentCommentId"))
      : null;

    if (!content)
      return errorResponse(422, "Échec de la validation", {
        content: "Le commentaire ne peut pas être vide.",
      });

    if (work.authorId === user.id && !parentCommentId) {
      return forbidden(
        "Vous ne pouvez pas publier un commentaire principal sur votre propre œuvre.",
      );
    }

    if (parentCommentId && !db.comments.some((c) => c.id === parentCommentId)) {
      return errorResponse(422, "Échec de la validation", {
        parentCommentId: "Commentaire parent introuvable.",
      });
    }

    const comment: DbComment = {
      id: db.generateId("comment"),
      workId: work.id,
      authorId: user.id,
      content,
      imageUrl: imageUrlFromForm(form),
      parentCommentId,
      createdAt: new Date().toISOString(),
    };
    db.comments.push(comment);
    return HttpResponse.json(db.serializeComment(comment, user), {
      status: 201,
    });
  }),

  // PATCH /comments/:commentId (COM-002) - author
  http.patch("*/comments/:commentId", async ({ request, params }) => {
    await delay(120);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    const comment = db.comments.find((c) => c.id === params.commentId);
    if (!comment) return notFound("Commentaire introuvable.");
    if (comment.authorId !== user.id)
      return forbidden("Vous n'avez pas les droits nécessaires.");

    const body = (await request.json()) as UpdateCommentPayload;
    if (!body.content || !body.content.trim()) {
      return errorResponse(422, "Échec de la validation", {
        content: "Le commentaire ne peut pas être vide.",
      });
    }
    comment.content = body.content.trim();
    return HttpResponse.json(db.serializeComment(comment, user));
  }),

  // DELETE /comments/:commentId (COM-003/011/ADM-003) - author or admin
  http.delete("*/comments/:commentId", async ({ request, params }) => {
    await delay(120);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    const index = db.comments.findIndex((c) => c.id === params.commentId);
    if (index === -1) return notFound("Commentaire introuvable.");
    const comment = db.comments[index];
    if (comment.authorId !== user.id && user.role !== "admin") {
      return forbidden("Vous n'avez pas les droits nécessaires.");
    }
    // Cascade
    const idsToRemove = new Set([comment.id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const c of db.comments) {
        if (
          c.parentCommentId &&
          idsToRemove.has(c.parentCommentId) &&
          !idsToRemove.has(c.id)
        ) {
          idsToRemove.add(c.id);
          changed = true;
        }
      }
    }
    for (let i = db.comments.length - 1; i >= 0; i -= 1) {
      if (idsToRemove.has(db.comments[i].id)) db.comments.splice(i, 1);
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
