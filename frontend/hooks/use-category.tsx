"use client";

import { useCallback, useState } from "react";
import { categoriesRepository } from "@/repositories";
import type { Category, CreateCategoryPayload, WorkPage } from "@/types/api";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [works, setWorks] = useState<WorkPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesRepository.list();
      setCategories(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateCategoryPayload) => {
    const category = await categoriesRepository.create(payload);
    setCategories((prev) => [...prev, category]);
    return category;
  }, []);

  const remove = useCallback(async (categoryId: string) => {
    await categoriesRepository.remove(categoryId);
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  }, []);

  const worksOf = useCallback(
    async (categoryId: string, page = 1, pageSize = 20) => {
      setLoading(true);
      setError(null);
      try {
        const data = await categoriesRepository.worksOf(
          categoryId,
          page,
          pageSize,
        );
        setWorks(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { categories, works, loading, error, list, create, remove, worksOf };
}
