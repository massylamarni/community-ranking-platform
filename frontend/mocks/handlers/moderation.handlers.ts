import { delay, http, HttpResponse } from "msw";
import { requireAdmin, forbidden, notFound } from "../utils";
import { db } from "../db";
import { RefuseWorkPayload } from "@/types/api";

export const moderationHandlers = [
  // GET /moderation/works (ADM-004) - admin
  http.get("*/moderation/works", async ({ request }) => {
    await delay(100);
    const admin = requireAdmin(request);
    if (!admin) return forbidden("Vous n'avez pas les droits nécessaires.");
    const url = new URL(request.url);
    const page = Math.max(0, Number(url.searchParams.get("page") ?? 0));
    const size = Math.max(1, Number(url.searchParams.get("size") ?? 20));
    const pending = db.works
      .filter((w) => w.status === "pending")
      .map((w) => db.serializeWorkResponse(w));
    const start = page * size;
    const content = pending.slice(start, start + size);
    return HttpResponse.json({
      content,
      pageable: { pageNumber: page, pageSize: size },
      totalPages: Math.ceil(pending.length / size),
      totalElements: pending.length,
      last: start + size >= pending.length,
      size,
      number: page,
      sort: { sorted: false, unsorted: true, empty: true },
      numberOfElements: content.length,
      first: page === 0,
      empty: content.length === 0,
    });
  }),

  // POST /moderation/works/:workId/accept (MOD-004/NOTIF-001) - admin
  http.post(
    "*/moderation/works/:workId/accept",
    async ({ request, params }) => {
      await delay(150);
      const admin = requireAdmin(request);
      if (!admin) return forbidden("Vous n'avez pas les droits nécessaires.");
      const work = db.findWorkByApiId(params.workId);
      if (!work) return notFound("Œuvre introuvable.");
      work.status = "approved";
      db.notify(
        work.authorId,
        "work_accepted",
        `Votre œuvre "${work.title}" a été acceptée.`,
      );
      return HttpResponse.json(db.serializeWorkResponse(work));
    },
  ),

  // POST /moderation/works/:workId/refuse (MOD-005/NOTIF-002) - admin
  http.post(
    "*/moderation/works/:workId/refuse",
    async ({ request, params }) => {
      await delay(150);
      const admin = requireAdmin(request);
      if (!admin) return forbidden("Vous n'avez pas les droits nécessaires.");
      const work = db.findWorkByApiId(params.workId);
      if (!work) return notFound("Œuvre introuvable.");
      let reason = "";
      try {
        const body = (await request.json()) as RefuseWorkPayload;
        reason = body?.reason ?? "";
      } catch {
        // no body sent
      }
      work.status = "rejected";
      const suffix = reason ? ` (${reason})` : "";
      db.notify(
        work.authorId,
        "work_refused",
        `Votre œuvre "${work.title}" a été refusée.${suffix}`,
      );
      return HttpResponse.json(db.serializeWorkResponse(work));
    },
  ),
];
