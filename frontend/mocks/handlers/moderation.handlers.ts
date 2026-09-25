import { delay, http, HttpResponse } from "msw";
import { requireAdmin, forbidden, notFound } from "../utils";
import { db, paginate } from "../db";
import { RefuseWorkPayload } from "@/types/api";

export const moderationHandlers = [
  // GET /moderation/works (ADM-004) - admin
  http.get("*/moderation/works", async ({ request }) => {
    await delay(100);
    const admin = requireAdmin(request);
    if (!admin) return forbidden("Vous n'avez pas les droits nécessaires.");
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
    const pending = db.works
      .filter((w) => w.status === "pending")
      .map((w) => db.serializeWork(w, admin));
    return HttpResponse.json(paginate(pending, page, pageSize));
  }),

  // POST /moderation/works/:workId/accept (MOD-004/NOTIF-001) - admin
  http.post(
    "*/moderation/works/:workId/accept",
    async ({ request, params }) => {
      await delay(150);
      const admin = requireAdmin(request);
      if (!admin) return forbidden("Vous n'avez pas les droits nécessaires.");
      const work = db.works.find((w) => w.id === params.workId);
      if (!work) return notFound("Œuvre introuvable.");
      work.status = "accepted";
      db.notify(
        work.authorId,
        "work_accepted",
        `Votre œuvre "${work.title}" a été acceptée.`,
      );
      return HttpResponse.json(db.serializeWork(work, admin));
    },
  ),

  // POST /moderation/works/:workId/refuse (MOD-005/NOTIF-002) - admin
  http.post(
    "*/moderation/works/:workId/refuse",
    async ({ request, params }) => {
      await delay(150);
      const admin = requireAdmin(request);
      if (!admin) return forbidden("Vous n'avez pas les droits nécessaires.");
      const work = db.works.find((w) => w.id === params.workId);
      if (!work) return notFound("Œuvre introuvable.");
      let reason = "";
      try {
        const body = (await request.json()) as RefuseWorkPayload;
        reason = body?.reason ?? "";
      } catch {
        // no body sent
      }
      work.status = "refused";
      const suffix = reason ? ` (${reason})` : "";
      db.notify(
        work.authorId,
        "work_refused",
        `Votre œuvre "${work.title}" a été refusée.${suffix}`,
      );
      return HttpResponse.json(db.serializeWork(work, admin));
    },
  ),
];
