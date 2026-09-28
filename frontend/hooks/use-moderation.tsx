"use client";

import { useCallback, useState } from "react";
import { moderationRepository } from "@/repositories";
import type { RefuseWorkPayload, WorkPage } from "@/types/api";

export function useModeration() {
  const [pending, setPending] = useState<WorkPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pendingWorks = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    setError(null);
    try {
      const data = await moderationRepository.pendingWorks(page, pageSize);
      setPending(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromPending = useCallback((workId: number) => {
    setPending((prev) =>
      prev
        ? { ...prev, items: prev.items.filter((w) => w.id !== workId) }
        : prev,
    );
  }, []);

  const accept = useCallback(
    async (workId: number) => {
      const work = await moderationRepository.accept(workId);
      removeFromPending(workId);
      return work;
    },
    [removeFromPending],
  );

  const refuse = useCallback(
    async (workId: number, payload: RefuseWorkPayload = {}) => {
      const work = await moderationRepository.refuse(workId, payload);
      removeFromPending(workId);
      return work;
    },
    [removeFromPending],
  );

  return { pending, loading, error, pendingWorks, accept, refuse };
}
