import { request } from "@/lib/http";
import type {
  SubmitWorkPayload,
  UpdateWorkPayload,
  VoteForWorkPayload,
  Work,
} from "@/types/api";

function toFormData(payload: SubmitWorkPayload | UpdateWorkPayload): FormData {
  const form = new FormData();
  if (payload.title !== undefined) form.set("title", payload.title);
  if (payload.description !== undefined)
    form.set("description", payload.description);
  payload.categoryIds?.forEach((id) => form.append("categoryIds", id));
  if (payload.image) form.set("image", payload.image);
  return form;
}

export const worksRepository = {
  submit(payload: SubmitWorkPayload) {
    return request<Work>("/works", {
      method: "POST",
      body: toFormData(payload),
    });
  },

  get(workId: string) {
    return request<Work>(`/works/${workId}`);
  },

  update(workId: string, payload: UpdateWorkPayload) {
    return request<Work>(`/works/${workId}`, {
      method: "PATCH",
      body: toFormData(payload),
    });
  },

  vote(workId: string, payload: VoteForWorkPayload): Promise<Work> {
    return request(`/works/${workId}/vote`, {
      method: "PATCH",
      body: payload,
    });
  },

  remove(workId: string) {
    return request<void>(`/works/${workId}`, { method: "DELETE" });
  },
};
