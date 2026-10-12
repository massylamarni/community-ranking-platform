import { delay, http, HttpResponse } from "msw";
import { db } from "../db";
import { VoteForWorkPayload } from "@/types/api";
import {
  currentUserFrom,
  errorResponse,
  forbidden,
  notFound,
  unauthorized,
} from "../utils";

export const votesHandlers = [
  // PUT /works/:workId/vote
  http.put("*/works/:workId/vote", async ({ request, params }) => {
    await delay(150);

    const user = currentUserFrom(request);
    if (!user) return unauthorized();

    const work = db.findWorkByApiId(params.workId);
    if (!work) return notFound("Œuvre introuvable.");

    if (work.authorId === user.id)
      return forbidden("Vous ne pouvez pas voter pour votre propre œuvre.");

    const body = (await request.json()) as VoteForWorkPayload;
    const newValue = body.value;

    if (newValue !== null && newValue !== 1 && newValue !== -1)
      return errorResponse(422, "Échec de la validation", {
        value: "La valeur du vote est invalide.",
      });

    const existingIndex = work.votes.findIndex((v) => v.userId === user.id);

    if (newValue === null) {
      // Remove (idempotent: nothing to do if no vote exists)
      if (existingIndex !== -1) work.votes.splice(existingIndex, 1);
    } else if (existingIndex !== -1) {
      // Replace (idempotent: same value leaves state unchanged)
      work.votes[existingIndex].value = newValue;
    } else {
      // Create
      work.votes.push({
        userId: user.id,
        value: newValue,
        createdAt: new Date().toISOString(),
      });
    }

    return HttpResponse.json(db.serializeWork(work, user));
  }),
];
