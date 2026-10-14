import { request } from "@/lib/http";
import type {
  Category,
  CategoryEntityResponse,
  Work,
  CreateCategoryPayload,
  SpringPage,
  WorkPage,
} from "@/types/api";

function normalizeCategory(entity: CategoryEntityResponse): Category {
  return { id: entity.id, name: entity.name };
}

function normalizeCategoryWork(entity: Work): Work {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    imageUrl: entity.imageUrl,
    author: entity.author,
    categories: entity.categories ?? [],
    status: entity.status,
    totalVotes: entity.totalVotes,
    score: entity.score,
  };
}

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

  async getById(categoryId: number) {
    const entity = await request<CategoryEntityResponse>(
      `/categories/${categoryId}`,
    );
    return normalizeCategory(entity);
  },

  async getByName(name: string) {
    const entity = await request<CategoryEntityResponse>(
      `/categories/name/${encodeURIComponent(name)}`,
    );
    return normalizeCategory(entity);
  },

  async update(categoryId: number, payload: CreateCategoryPayload) {
    const entity = await request<CategoryEntityResponse>(
      `/categories/${categoryId}`,
      { method: "PUT", body: payload },
    );
    return normalizeCategory(entity);
  },

  remove(categoryId: number) {
    return request<void>(`/categories/${categoryId}`, { method: "DELETE" });
  },

  async worksOf(categoryId: number, page = 1, pageSize = 20) {
    const response = await request<SpringPage<Work>>(
      `/categories/${categoryId}/works`,
      { query: { page: Math.max(0, page - 1), size: pageSize } },
    );
    const workPage: WorkPage = {
      items: response.content.map(normalizeCategoryWork),
      page: response.number + 1,
      pageSize: response.size,
      total: response.totalElements,
    };
    return workPage;
  },
};
