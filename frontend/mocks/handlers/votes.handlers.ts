import { http } from "msw";

export const votesHandlers = [
  // PUT /works/:workId/vote (VOTE-001/002/004/005; refuses VOTE-006, VOTE-003)
  http.put("*/works/:workId/vote", async ({ request, params }) => {}),
];
