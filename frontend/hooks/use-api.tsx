"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ApiErrorBody } from "@/types/api";

type ToastMessages = {
  loading: string;
  success: string;
  error: string;
};

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorBody | null>(null);

  async function run<T>(
    promise: Promise<T>,
    messages: ToastMessages,
  ): Promise<boolean> {
    setError(null);
    setLoading(true);
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: (err) => err?.message ?? messages.error,
    });
    try {
      await promise;
      return true;
    } catch (err) {
      setError(err as ApiErrorBody);
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { run, loading, error, fieldErrors: error?.fields };
}
