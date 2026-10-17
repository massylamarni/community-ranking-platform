import type { VoteForWorkPayload, VoteForWorkReponse } from "@/types/api";

export const mockVote = jest.fn<
  Promise<VoteForWorkReponse>,
  [number, VoteForWorkPayload]
>();
