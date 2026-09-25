import { delay, http, HttpResponse } from "msw";
import { db } from "../db";
import { VoteForWorkPayload } from "@/types/api";
import { currentUserFrom, forbidden, notFound, unauthorized } from "../utils";

export const votesHandlers = [
  // PUT /works/:workId/vote (VOTE-001/002/004/005; refuses VOTE-006, VOTE-003)
  http.put("*/works/:workId/vote", async ({ request, params }) => {
    await delay(120);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    const work = db.works.find((w) => w.id === params.workId);
    if (!work) return notFound("Œuvre introuvable.");

    if (work.authorId === user.id) {
      return forbidden("Vous ne pouvez pas voter pour votre propre œuvre.");
    }

    const body = (await request.json()) as VoteForWorkPayload;
    const existingIndex = work.votes.findIndex((v) => v.userId === user.id);

    if (body.value === null) {
      // VOTE-005: withdraw.
      if (existingIndex !== -1) work.votes.splice(existingIndex, 1);
    } else {
      if (existingIndex !== -1) {
        // VOTE-004: switch
        work.votes[existingIndex] = {
          userId: user.id,
          value: body.value,
          createdAt: new Date().toISOString(),
        };
      } else {
        // VOTE-001/002: cast a fresh vote.
        work.votes.push({
          userId: user.id,
          value: body.value,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return HttpResponse.json(db.serializeWork(work, user));
  }),
];
