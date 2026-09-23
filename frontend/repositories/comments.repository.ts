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
  if (payload.parentCommentId)
    form.set("parentCommentId", payload.parentCommentId);
  if (payload.image) form.set("image", payload.image);
  return form;
}

export const commentsRepository = {
  list(workId: string, page = 1, pageSize = 20) {
    return request<CommentPage>(`/works/${workId}/comments`, {
      query: { page, pageSize },
    });
  },

  create(workId: string, payload: CreateCommentPayload) {
    return request<Comment>(`/works/${workId}/comments`, {
      method: "POST",
      body: toFormData(payload),
    });
  },

  update(commentId: string, payload: UpdateCommentPayload) {
    return request<Comment>(`/comments/${commentId}`, {
      method: "PATCH",
      body: payload,
    });
  },

  remove(commentId: string) {
    return request<void>(`/comments/${commentId}`, { method: "DELETE" });
  },
};
