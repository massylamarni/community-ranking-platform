"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/errors";

type ToastMessages = {
  loading?: string;
  success?: string;
  error: string;
};

type RunResult<T> = { ok: true; data: T } | { ok: false };

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const run = useCallback(async function run<T>(
    promise: Promise<T>,
    messages: ToastMessages,
  ): Promise<RunResult<T>> {
    setError(null);
    setLoading(true);
    toast.promise(promise, {
      ...(messages.loading && { loading: messages.loading }),
      ...(messages.success && { success: messages.success }),
      error: (err) => err?.message ?? messages.error,
    });
    try {
      return { ok: true, data: await promise };
    } catch (err) {
      setError(err as ApiError);
      return { ok: false };
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, error };
}
