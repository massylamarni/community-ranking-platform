"use client";

import { useCallback, useState } from "react";
import { categoriesRepository } from "@/repositories/categories.repository";
import type { Category } from "@/types/api";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesRepository.list();
      const safeData = data ?? [];
      setCategories(safeData);
      return safeData;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      setCategories([]);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    list,
  };
}
