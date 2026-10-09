import { expect, type APIRequestContext } from "@playwright/test";
import { apiURL } from "./env";
import { getSuffix } from ".";
import { CategoryEntityResponse } from "@/types/api";

export function newCategory() {
  return `category_${getSuffix()}`;
}

export function deleteCategoryButton(
  page: import("@playwright/test").Page,
  categoryName: string,
) {
  return page.getByRole("button", {
    name: `Supprimer ${categoryName} (CAT-002)`,
  });
}

export function createCategoryButton(page: import("@playwright/test").Page) {
  return page.locator("button:has(svg.lucide-plus)");
}

/* Direct inserts */

export async function directCreateCategory(
  request: APIRequestContext,
  name: string,
): Promise<CategoryEntityResponse> {
  const response = await request.post(`${apiURL}/categories`, {
    data: { name },
  });
  expect(response.status()).toBe(201);
  return (await response.json()) as CategoryEntityResponse;
}
