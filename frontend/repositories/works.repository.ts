import { request } from "@/lib/http";
import type {
  CreateWorkPayload,
  SubmitWorkPayload,
  UpdateWorkPayload,
  Work,
  WorkResponse,
  WorkStatus,
} from "@/types/api";

export interface ListWorksQuery {
  status?: WorkStatus;
  categoryId?: number;
  title?: string;
}

export function normalizeWorkResponse(response: WorkResponse): Work {
  return response;
}

function createFormData(payload: CreateWorkPayload): FormData {
  const form = new FormData();
  form.set("title", payload.title);
  form.set("description", payload.description);
  if (payload.categoryIds) {
    for (const id of payload.categoryIds) {
      form.append("categoryIds", typeof id === "string" ? id : String(id));
    }
  }
  if (payload.imageUrl != null) form.set("imageUrl", payload.imageUrl);
  if (payload.image) form.set("image", payload.image);
  return form;
}

export const worksRepository = {
  async list(query: ListWorksQuery = {}) {
    const response = await request<WorkResponse[]>("/works", {
      query: {
        status: query.status,
        categoryId: query.categoryId,
        title: query.title,
      },
    });
    return response.map(normalizeWorkResponse);
  },

  async create(payload: CreateWorkPayload) {
    const body = payload.image
      ? createFormData(payload)
      : {
          title: payload.title,
          description: payload.description,
          imageUrl: payload.imageUrl,
          categoryIds: payload.categoryIds,
        };
    const response = await request<WorkResponse>("/works", {
      method: "POST",
      body,
    });
    return normalizeWorkResponse(response);
  },

  async get(workId: number) {
    const response = await request<WorkResponse>(`/works/${workId}`);
    return normalizeWorkResponse(response);
  },

  async submit(workId: number, payload: SubmitWorkPayload) {
    const response = await request<WorkResponse>(`/works/${workId}/submit`, {
      method: "POST",
      body: payload,
    });
    return normalizeWorkResponse(response);
  },

  async update(workId: number, payload: UpdateWorkPayload) {
    const response = await request<WorkResponse>(`/works/${workId}`, {
      method: "PATCH",
      body: payload,
    });
    return normalizeWorkResponse(response);
  },

  async uploadImage(workId: number, image: File) {
    const form = new FormData();
    form.set("image", image);
    const response = await request<WorkResponse>(`/works/${workId}/image`, {
      method: "POST",
      body: form,
    });
    return normalizeWorkResponse(response);
  },

  remove(workId: number) {
    return request<void>(`/works/${workId}`, { method: "DELETE" });
  },
};
