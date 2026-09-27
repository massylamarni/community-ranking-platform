import { request } from "@/lib/http";
import type { Work } from "@/types/api";

export const votesRepository = {
  vote(workId: string, value: 1 | -1 | null) {
    return request<Work>(`/works/${workId}/vote`, {
      method: "PUT",
      body: { value },
    });
  },
};
