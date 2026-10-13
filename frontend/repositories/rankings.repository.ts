import { request } from "@/lib/http";
import type { GetRankings, RankingPeriod, RankingSnapshot } from "@/types/api";

export const rankingsRepository = {
  get(
    options: {
      categoryId?: string;
      period?: RankingPeriod;
      page?: number;
      pageSize?: number;
    } = {},
  ) {
    const { categoryId, period = "all", page = 1, pageSize = 20 } = options;
    return request<GetRankings>("/rankings", {
      query: { categoryId, period, page, pageSize },
    });
  },

  archive(period: "week" | "month") {
    return request<RankingSnapshot[]>("/rankings/archive", {
      query: { period },
    });
  },
};
