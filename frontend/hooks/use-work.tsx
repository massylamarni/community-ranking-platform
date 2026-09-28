"use client";

import { useCallback, useState } from "react";
import { worksRepository } from "@/repositories";
import type { SubmitWorkPayload, UpdateWorkPayload, Work } from "@/types/api";

export function useWorks() {
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const get = useCallback(async (workId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await worksRepository.get(workId);
      setWork(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submit = useCallback(async (payload: SubmitWorkPayload) => {
    const created = await worksRepository.submit(payload);
    setWork(created);
    return created;
  }, []);

  const update = useCallback(
    async (workId: string, payload: UpdateWorkPayload) => {
      const updated = await worksRepository.update(workId, payload);
      setWork(updated);
      return updated;
    },
    [],
  );

  const remove = useCallback(async (workId: string) => {
    await worksRepository.remove(workId);
    setWork((prev) => (prev?.id === workId ? null : prev));
  }, []);

  return { work, loading, error, get, submit, update, remove };
}
