"use client";

import { ApiError } from "@/lib/errors";
import { useCallback, useEffect, useState } from "react";

type Settled<T> = {
  fetcher: () => Promise<T>;
  data?: T;
  error?: ApiError;
};

export function useQuery<T>(fetcher: () => Promise<T>) {
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    let isCurrent = true;
    fetcher().then(
      (data) => isCurrent && setSettled({ fetcher, data }),
      (error) => isCurrent && setSettled({ fetcher, error }),
    );
    return () => {
      isCurrent = false;
    };
  }, [fetcher]);

  const isSettled = settled?.fetcher === fetcher;

  const setData = useCallback((next: T | ((prev: T) => T)) => {
    setSettled((prev) => {
      if (!prev || prev.data === undefined) return prev;
      const data =
        typeof next === "function" ? (next as (p: T) => T)(prev.data) : next;
      return { ...prev, data };
    });
  }, []);

  return {
    data: isSettled ? settled.data : undefined,
    error: isSettled ? settled.error : undefined,
    loading: !isSettled,
    setData,
  };
}
