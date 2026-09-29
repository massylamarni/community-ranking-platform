"use client";

import { useCallback, useEffect, useState } from "react";
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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await list();
      } catch (err) {
        console.error("Failed to initialize auth", err);
        if (mounted) setCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [list]);

  const create = useCallback(async (payload: CreateCategoryPayload) => {
    const category = await categoriesRepository.create(payload);
    setCategories((prev) => [...prev, category]);
    return category;
  }, []);

  const getById = useCallback((categoryId: number) => {
    return categoriesRepository.getById(categoryId);
  }, []);

  const getByName = useCallback((name: string) => {
    return categoriesRepository.getByName(name);
  }, []);

  const update = useCallback(
    async (categoryId: number, payload: CreateCategoryPayload) => {
      const category = await categoriesRepository.update(categoryId, payload);
      setCategories((prev) =>
        prev.map((current) =>
          current.id === category.id ? category : current,
        ),
      );
      return category;
    },
    [],
  );

  const remove = useCallback(async (categoryId: number) => {
    await categoriesRepository.remove(categoryId);
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  }, []);

  const worksOf = useCallback(
    async (categoryId: number, page = 1, pageSize = 20) => {
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

  return {
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
  };
}
