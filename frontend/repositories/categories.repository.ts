import { request } from "@/lib/http";
import type {
  Category,
  CategoryEntityResponse,
  CategoryWorkEntity,
  CreateCategoryPayload,
  SpringPage,
  Work,
  WorkPage,
} from "@/types/api";

function normalizeCategory(entity: CategoryEntityResponse): Category {
  return { id: entity.categoryId, name: entity.name };
}

function relationCategoryName(
  relation: Record<string, unknown>,
): string | null {
  if (typeof relation.name === "string") return relation.name;
  const category = relation.category;
  if (category && typeof category === "object" && "name" in category) {
    const name = category.name;
    if (typeof name === "string") return name;
  }
  return null;
}

function normalizeCategoryWork(entity: CategoryWorkEntity): Work {
  const author =
    typeof entity.author === "string"
      ? entity.author
      : (entity.author?.username ?? "unknown");
  const votes = entity.votes ?? [];
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    imageUrl: entity.imageUrl,
    author: author,
    categories: (entity.oeuvreCategories ?? [])
      .map(relationCategoryName)
      .filter((name): name is string => name !== null),
    status: entity.status,
    totalVotes: votes.length,
    score: votes.reduce((score, vote) => {
      const value = vote.value;
      return score + (typeof value === "number" ? value : 0);
    }, 0),
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
    const response = await request<SpringPage<CategoryWorkEntity>>(
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
