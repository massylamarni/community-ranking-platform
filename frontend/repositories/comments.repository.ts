import { request } from "@/lib/http";
import type {
  Comment,
  CommentPage,
  CreateCommentPayload,
  UpdateCommentPayload,
} from "@/types/api";

function toFormData(payload: CreateCommentPayload): FormData {
  const form = new FormData();
  form.set("content", payload.content);
  if (payload.parentCommentId != null) {
    form.set("parentCommentId", String(payload.parentCommentId));
  }
  if (payload.image) form.set("image", payload.image);
  return form;
}

export const commentsRepository = {
  list(workId: number, page = 1, pageSize = 20) {
    return request<CommentPage>(`/works/${workId}/comments`, {
      query: { page, pageSize },
    });
  },

  create(workId: number, payload: CreateCommentPayload) {
    return request<Comment>(`/works/${workId}/comments`, {
      method: "POST",
      body: toFormData(payload),
    });
  },

  update(commentId: number, payload: UpdateCommentPayload) {
    return request<Comment>(`/comments/${commentId}`, {
      method: "PATCH",
      body: toFormData(payload),
    });
  },

  remove(commentId: number) {
    return request<void>(`/comments/${commentId}`, { method: "DELETE" });
  },
};
