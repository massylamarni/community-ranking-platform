import { request } from "@/lib/http";
import type { VoteForWorkPayload, VoteForWorkReponse } from "@/types/api";

export const votesRepository = {
  vote(
    workId: number,
    payload: VoteForWorkPayload,
  ): Promise<VoteForWorkReponse> {
    return request(`/works/${workId}/vote`, {
      method: "PUT",
      body: payload,
    });
  },
};
