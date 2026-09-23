import { request } from "@/lib/http";
import type { RefuseWorkPayload, Work, WorkPage } from "@/types/api";

export const moderationRepository = {
  pendingWorks(page = 1, pageSize = 20) {
    return request<WorkPage>("/moderation/works", {
      query: { page, pageSize },
    });
  },

  accept(workId: string) {
    return request<Work>(`/moderation/works/${workId}/accept`, {
      method: "POST",
    });
  },

  refuse(workId: string, payload: RefuseWorkPayload = {}) {
    return request<Work>(`/moderation/works/${workId}/refuse`, {
      method: "POST",
      body: payload,
    });
  },
};
