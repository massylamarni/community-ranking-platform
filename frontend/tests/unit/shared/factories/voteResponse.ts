import type { VoteForWorkReponse, Work } from "@/types/api";

export function buildVoteResponse(
  oeuvre: Work,
  value: 1 | -1,
): VoteForWorkReponse {
  return {
    id: "vote-1",
    userId: "user-1",
    value,
    createdAt: "2026-01-01T00:00:00Z",
    oeuvre,
  };
}
