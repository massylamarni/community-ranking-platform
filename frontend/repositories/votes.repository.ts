import { request } from "@/lib/http";
import type { VoteForWorkPayload, Work } from "@/types/api";

export const votesRepository = {
  vote(workId: string, payload: VoteForWorkPayload): Promise<Work> {
    return request(`/works/${workId}/vote`, {
      method: "PATCH",
      body: payload,
    });
  },
};
