/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import type { categoriesRepository } from "@/repositories/categories.repository";
import { useCategories } from "@/hooks/use-categories";
import type { Category } from "@/types/api";

type Repository = typeof categoriesRepository;

const mockList = jest.fn<ReturnType<Repository["list"]>, []>();

jest.mock("@/repositories/categories.repository", () => ({
  categoriesRepository: { list: () => mockList() },
}));

describe("useCategories", () => {
  it("stores categories returned by the repository", async () => {
    const categories: Category[] = [{ id: 3, name: "Painting" }];
    mockList.mockResolvedValue(categories);
    const { result } = renderHook(() => useCategories());
    let returned: Category[] | undefined;

    await act(async () => {
      returned = await result.current.list();
    });

    expect(returned).toEqual(categories);
    expect(result.current.categories).toEqual(categories);
    expect(result.current.loading).toBe(false);
  });

  it("clears categories, stores the error, and rethrows on failure", async () => {
    const error = new Error("Unavailable");
    mockList.mockRejectedValue(error);
    const { result } = renderHook(() => useCategories());
    let rejection: unknown;

    await act(async () => {
      try {
        await result.current.list();
      } catch (err) {
        rejection = err;
      }
    });

    expect(rejection).toBe(error);
    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBe(error);
    expect(result.current.loading).toBe(false);
  });
});
