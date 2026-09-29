// hooks/use-category.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { categoriesRepository } from "@/repositories";
import type { Category, CreateCategoryPayload, WorkPage } from "@/types/api";

function useCategoryState() {
  const [categories, setCategory] = useState<Category[]>([]);
  const [works, setWorks] = useState<WorkPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesRepository.list();
      setCategory(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    list().catch((err) => {
      console.error("Failed to load categories", err);
    });
  }, [list]);

  const create = useCallback(async (payload: CreateCategoryPayload) => {
    const category = await categoriesRepository.create(payload);
    setCategory((prev) => [...prev, category]);
    return category;
  }, []);

  const update = useCallback(
    async (categoryId: number, payload: CreateCategoryPayload) => {
      const category = await categoriesRepository.update(categoryId, payload);
      setCategory((prev) =>
        prev.map((c) => (c.id === category.id ? category : c)),
      );
      return category;
    },
    [],
  );

  const remove = useCallback(async (categoryId: number) => {
    await categoriesRepository.remove(categoryId);
    setCategory((prev) => prev.filter((c) => c.id !== categoryId));
  }, []);

  const getById = useCallback(
    (id: number) => categoriesRepository.getById(id),
    [],
  );
  const getByName = useCallback(
    (name: string) => categoriesRepository.getByName(name),
    [],
  );

  const worksOf = useCallback(
    async (categoryId: number, page = 1, pageSize = 20) => {
      const data = await categoriesRepository.worksOf(
        categoryId,
        page,
        pageSize,
      );
      setWorks(data);
      return data;
    },
    [],
  );

  return useMemo(
    () => ({
      categories,
      works,
      loading,
      error,
      list,
      create,
      getById,
      getByName,
      update,
      remove,
      worksOf,
    }),
    [
      categories,
      works,
      loading,
      error,
      list,
      create,
      getById,
      getByName,
      update,
      remove,
      worksOf,
    ],
  );
}

type CategoryContextValue = ReturnType<typeof useCategoryState>;

const CategoryContext = createContext<CategoryContextValue | null>(null);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const value = useCategoryState();
  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const ctx = useContext(CategoryContext);
  if (!ctx) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return ctx;
}
