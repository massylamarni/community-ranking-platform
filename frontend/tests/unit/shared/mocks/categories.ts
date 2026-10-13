import type { Category } from "@/types/api";

export const mockUseCategory = jest.fn();

export const categoryActions = {
  list: jest.fn(),
  getById: jest.fn(),
  worksOf: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
};

export const categoryContextModule = { useCategory: () => mockUseCategory() };

export const cat = (id: number, name: string): Category =>
  ({ id, name }) as Category;

export function mockCategoriesState(categories: Category[]) {
  mockUseCategory.mockReturnValue({ categories, ...categoryActions });
}
