import { request } from "@/lib/http";
import type {
  RefuseWorkPayload,
  SpringPage,
  Work,
  WorkPage,
  WorkResponse,
} from "@/types/api";

function normalizeWorkResponse(response: WorkResponse): Work {
  return {
    id: response.id,
    title: response.title,
    description: response.description,
    status: response.status,
    author: { username: response.author },
    imageUrl: response.imageUrl,
    categories: response.categories,
    totalVotes: response.totalVotes,
  };
}

export const moderationRepository = {
  async pendingWorks(page = 1, pageSize = 20) {
    const response = await request<SpringPage<WorkResponse>>(
      "/moderation/works",
      {
        query: { page: Math.max(0, page - 1), size: pageSize },
      },
    );
    return {
      items: response.content.map(normalizeWorkResponse),
      page: response.number + 1,
      pageSize: response.size,
      total: response.totalElements,
    } satisfies WorkPage;
  },

  async accept(workId: number) {
    const response = await request<WorkResponse>(
      `/moderation/works/${workId}/accept`,
      {
        method: "POST",
      },
    );
    return normalizeWorkResponse(response);
  },

  async refuse(workId: number, payload: RefuseWorkPayload = {}) {
    const response = await request<WorkResponse>(
      `/moderation/works/${workId}/refuse`,
      {
        method: "POST",
        body: payload,
      },
    );
    return normalizeWorkResponse(response);
  },
};
