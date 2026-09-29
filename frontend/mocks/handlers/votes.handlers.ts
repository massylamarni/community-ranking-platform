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
  // PATCH /works/:workId/vote
  http.patch("*/works/:workId/vote", async ({ request, params }) => {
    await delay(150);

    const user = currentUserFrom(request);
    if (!user) return unauthorized();

    const work = db.works.find((w) => w.id === params.workId);
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
    const existingVote =
      existingIndex !== -1 ? work.votes[existingIndex] : null;

    if (newValue === null) {
      if (existingIndex !== -1) work.votes.splice(existingIndex, 1);
    } else if (existingVote && existingVote.value === newValue) {
      work.votes.splice(existingIndex, 1);
    } else if (existingVote) {
      existingVote.value = newValue;
    } else {
      work.votes.push({
        userId: user.id,
        value: newValue,
        createdAt: new Date().toISOString(),
      });
    }

    return HttpResponse.json(db.serializeWork(work, user));
  }),
];
