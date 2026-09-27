import { request } from "@/lib/http";
import type { SubmitWorkPayload, UpdateWorkPayload, Work } from "@/types/api";

function toFormData(payload: SubmitWorkPayload): FormData {
  const form = new FormData();
  form.set("title", payload.title);
  form.set("description", payload.description);
  payload.categoryIds.forEach((id) => form.append("categoryIds", id));
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
      body: payload,
    });
  },

  remove(workId: string) {
    return request<void>(`/works/${workId}`, { method: "DELETE" });
  },
};
