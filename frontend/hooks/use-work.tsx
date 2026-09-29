"use client";

import { useCallback, useState } from "react";
import { worksRepository } from "@/repositories";
import type {
  CreateWorkPayload,
  SubmitWorkPayload,
  UpdateWorkPayload,
  Work,
} from "@/types/api";
import type { ListWorksQuery } from "@/repositories/works.repository";

export function useWorks() {
  const [work, setWork] = useState<Work | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const list = useCallback(async (query: ListWorksQuery = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await worksRepository.list(query);
      setWorks(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(async (workId: number) => {
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

  const create = useCallback(async (payload: CreateWorkPayload) => {
    const created = await worksRepository.create(payload);
    setWork(created);
    return created;
  }, []);

  const submit = useCallback(
    async (workId: number, payload: SubmitWorkPayload) => {
      const submitted = await worksRepository.submit(workId, payload);
      setWork(submitted);
      return submitted;
    },
    [],
  );

  const update = useCallback(
    async (workId: number, payload: UpdateWorkPayload) => {
      const updated = await worksRepository.update(workId, payload);
      setWork(updated);
      return updated;
    },
    [],
  );

  const uploadImage = useCallback(async (workId: number, image: File) => {
    const updated = await worksRepository.uploadImage(workId, image);
    setWork(updated);
    return updated;
  }, []);

  const remove = useCallback(async (workId: number) => {
    await worksRepository.remove(workId);
    setWork((prev) => (prev?.id === workId ? null : prev));
  }, []);

  return {
    work,
    works,
    loading,
    error,
    list,
    get,
    create,
    submit,
    update,
    uploadImage,
    remove,
  };
}
