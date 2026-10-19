/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import type { rankingsRepository } from "@/repositories/rankings.repository";
import { useRankings } from "@/hooks/use-rankings";
import type { RankingPage } from "@/types/api";

type Repository = typeof rankingsRepository;

const mockListArchives = jest.fn<
  ReturnType<Repository["listArchives"]>,
  Parameters<Repository["listArchives"]>
>();
const mockListArchivedPeriods = jest.fn<
  ReturnType<Repository["listArchivedPeriods"]>,
  Parameters<Repository["listArchivedPeriods"]>
>();

jest.mock("@/repositories/rankings.repository", () => ({
  rankingsRepository: {
    listArchives: (...args: Parameters<typeof mockListArchives>) =>
      mockListArchives(...args),
    listArchivedPeriods: (...args: Parameters<typeof mockListArchivedPeriods>) =>
      mockListArchivedPeriods(...args),
  },
}));

describe("useRankings", () => {
  it("passes archive filters to the repository and stores the returned page", async () => {
    const query = {
      periodType: "month" as const,
      periodStart: "2026-09-01",
      categoryId: 4,
      page: 2,
      pageSize: 10,
    };
    const ranking: RankingPage = {
      items: [],
      page: 2,
      pageSize: 10,
      total: 0,
    };
    mockListArchives.mockResolvedValue(ranking);
    const { result } = renderHook(() => useRankings());

    await act(async () => {
      await result.current.listArchives(query);
    });

    expect(mockListArchives).toHaveBeenCalledWith(query);
    expect(result.current.ranking).toEqual(ranking);
    expect(result.current.loading).toBe(false);
  });

  it("clears archive periods when the repository rejects", async () => {
    mockListArchivedPeriods.mockRejectedValue(new Error("Unavailable"));
    const { result } = renderHook(() => useRankings());
    let rejection: unknown;

    await act(async () => {
      try {
        await result.current.listPeriods("week");
      } catch (error) {
        rejection = error;
      }
    });

    expect(mockListArchivedPeriods).toHaveBeenCalledWith("week");
    expect(result.current.periods).toEqual([]);
    expect(rejection).toBeInstanceOf(Error);
  });
});
