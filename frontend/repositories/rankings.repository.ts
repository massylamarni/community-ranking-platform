import { request } from "@/lib/http";
import type {
  RankingArchiveListQuery,
  RankingEntry,
  RankingListQuery,
  RankingPage,
  RankingPeriod,
  SpringPage,
} from "@/types/api";

function normalizeRankingResponse(page: SpringPage<RankingEntry>): RankingPage {
  return {
    items: page.content,
    page: page.number + 1,
    pageSize: page.size,
    total: page.totalElements,
  };
}

export const rankingsRepository = {
  async list({
    categoryId,
    period = "all",
    page = 1,
    pageSize = 20,
  }: RankingListQuery = {}) {
    const response = await request<SpringPage<RankingEntry>>("/rankings", {
      query: {
        categoryId,
        period,
        page: Math.max(0, page - 1),
        size: pageSize,
      },
    });
    return normalizeRankingResponse(response);
  },

  async listGlobal(page = 1, pageSize = 20) {
    // TODO
    const response = await request<SpringPage<RankingEntry>>(
      "/rankings/global",
      {
        query: { page: Math.max(0, page - 1), size: pageSize },
      },
    );
    return normalizeRankingResponse(response);
  },

  async listArchives({
    periodType = "week",
    periodStart,
    categoryId,
    page = 1,
    pageSize = 20,
  }: RankingArchiveListQuery = {}) {
    const response = await request<SpringPage<RankingEntry>>(
      "/rankings/archives",
      {
        query: {
          periodType,
          periodStart,
          categoryId,
          page: Math.max(0, page - 1),
          size: pageSize,
        },
      },
    );
    return normalizeRankingResponse(response);
  },

  listArchivedPeriods(periodType?: RankingPeriod) {
    return request<string[]>("/rankings/archives/periods", {
      query: { periodType },
    });
  },
};
