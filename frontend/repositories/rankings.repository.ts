import { request } from "@/lib/http";
import type {
  GetRankings,
  GlobalRankingItem,
  RankingPeriod,
  RankingSnapshot,
  SpringPage,
} from "@/types/api";

interface SpringRankingItem {
  id?: number;
  oeuvreId?: number;
  title: string;
  author?: string | { username?: string };
  imageUrl?: string | null;
  categories?: string[];
  score: number;
  position?: number;
}

function normalizeRankingResponse(res: unknown): GlobalRankingItem[] {
  if (!res) return [];

  // Case 1: Spring Boot Page<RankingItemResponse> -> res.content
  const springPage = res as SpringPage<SpringRankingItem>;
  if (Array.isArray(springPage.content)) {
    const list = springPage.content.map((item, index) => {
      const authorName =
        typeof item.author === "string"
          ? item.author
          : (item.author?.username ?? "Anonyme");
      return {
        id: item.id ?? item.oeuvreId ?? index + 1,
        position: typeof item.position === "number" ? item.position : index + 1,
        title: item.title ?? "Sans titre",
        author: authorName,
        categories: Array.isArray(item.categories) ? item.categories : [],
        score: typeof item.score === "number" ? item.score : 0,
        imageUrl: item.imageUrl ?? null,
      };
    });
    return list
      .sort((a, b) => b.score - a.score)
      .map((item, i) => ({
        ...item,
        position: item.position || i + 1,
      }));
  }

  // Case 2: MSW GetRankings -> res.entries
  const getRankings = res as GetRankings;
  if (Array.isArray(getRankings.entries)) {
    const list = getRankings.entries.map((entry, index) => {
      const work = entry.work;
      const score =
        typeof work?.score === "number" ? work.score : (work?.totalVotes ?? 0);
      return {
        id: work?.id ?? index + 1,
        position: typeof entry.rank === "number" ? entry.rank : index + 1,
        title: work?.title ?? "Sans titre",
        author: work?.author ?? "Anonyme",
        categories: Array.isArray(work?.categories) ? work.categories : [],
        score,
        imageUrl: work?.imageUrl ?? null,
      };
    });
    return list
      .sort((a, b) => b.score - a.score)
      .map((item, i) => ({
        ...item,
        position: item.position || i + 1,
      }));
  }

  // Case 3: Raw array
  if (Array.isArray(res)) {
    return (res as SpringRankingItem[])
      .map((item, index) => ({
        id: item.id ?? index + 1,
        position: typeof item.position === "number" ? item.position : index + 1,
        title: item.title ?? "Sans titre",
        author: typeof item.author === "string" ? item.author : "Anonyme",
        categories: Array.isArray(item.categories) ? item.categories : [],
        score: typeof item.score === "number" ? item.score : 0,
        imageUrl: item.imageUrl ?? null,
      }))
      .sort((a, b) => b.score - a.score)
      .map((item, i) => ({ ...item, position: i + 1 }));
  }

  return [];
}

export const rankingsRepository = {
  async getGlobal(page = 1, pageSize = 20): Promise<GlobalRankingItem[]> {
    try {
      const res = await request<unknown>("/rankings/global", {
        query: { page: Math.max(0, page - 1), size: pageSize },
      });
      return normalizeRankingResponse(res);
    } catch {
      const res = await request<unknown>("/rankings", {
        query: { period: "all", page, pageSize },
      });
      return normalizeRankingResponse(res);
    }
  },

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
