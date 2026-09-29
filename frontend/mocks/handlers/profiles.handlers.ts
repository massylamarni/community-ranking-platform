import { delay, http, HttpResponse } from "msw";
import { db, findUserByUsername } from "../db";
import { currentUserFrom, notFound } from "../utils";

export const profilesHandlers = [
  // GET /users/:username (PROF-001/002/006)
  http.get("*/users/:username", async ({ params }) => {
    await delay(80);
    const user = findUserByUsername(String(params.username));
    if (!user) return notFound("Utilisateur introuvable.");
    return HttpResponse.json({ username: user.username });
  }),

  // GET /users/:username/activity (PROF-003)
  http.get("*/users/:username/activity", async ({ request, params }) => {
    await delay(100);
    const user = findUserByUsername(String(params.username));
    if (!user) return notFound("Utilisateur introuvable.");
    const viewer = currentUserFrom(request);

    const works = db.works
      .filter((w) => w.authorId === user.id && w.status === "approved")
      .map((w) => db.serializeWork(w, viewer));

    const comments = db.comments
      .filter((c) => c.authorId === user.id)
      .map((c) => db.serializeComment(c, viewer));

    const favorites = db.works
      .filter(
        (w) =>
          w.status === "approved" &&
          w.votes.some((v) => v.userId === user.id && v.value === 1),
      )
      .map((w) => db.serializeWork(w, viewer));

    return HttpResponse.json({ works, comments, favorites });
  }),
];
