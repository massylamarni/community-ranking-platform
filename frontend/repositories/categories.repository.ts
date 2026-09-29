import { request } from "@/lib/http";
import type { Category, CreateCategoryPayload, WorkPage } from "@/types/api";

export const categoriesRepository = {
  list() {
    return request<Category[]>("/categories");
  },

  create(payload: CreateCategoryPayload) {
    return request<Category>("/categories", {
      method: "POST",
      body: payload,
    });
  },

  remove(categoryId: string) {
    return request<void>(`/categories/${categoryId}`, { method: "DELETE" });
  },

  worksOf(categoryId: string, page = 1, pageSize = 20) {
    return request<WorkPage>(`/categories/${categoryId}/works`, {
      query: { page, pageSize },
    });
  },
};
