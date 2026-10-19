"use client";

import { useCallback, useState } from "react";
import { rankingsRepository } from "@/repositories/rankings.repository";
import type {
  RankingArchiveListQuery,
  RankingListQuery,
  RankingPage,
  RankingPeriod,
} from "@/types/api";

export function useRankings() {
  const [ranking, setRanking] = useState<RankingPage | null>(null);
  const [periods, setPeriods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const list = useCallback(async (query: RankingListQuery = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await rankingsRepository.list(query);
      setRanking(data);
      return data;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const listGlobal = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    setError(null);
    try {
      const data = await rankingsRepository.listGlobal(page, pageSize);
      setRanking(data);
      return data;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const listArchives = useCallback(
    async (query: RankingArchiveListQuery = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await rankingsRepository.listArchives(query);
        setRanking(data);
        return data;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const listPeriods = useCallback(async (periodType?: RankingPeriod) => {
    try {
      const data = await rankingsRepository.listArchivedPeriods(periodType);
      const safePeriods = data ?? [];
      setPeriods(safePeriods);
      return safePeriods;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setPeriods([]);
      throw e;
    }
  }, []);

  return {
    ranking,
    periods,
    loading,
    error,
    list,
    listGlobal,
    listArchives,
    listPeriods,
    setRanking,
  };
}
