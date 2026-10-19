/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import type { moderationRepository } from "@/repositories/moderation.repository";
import { useModeration } from "@/hooks/use-moderation";
import { buildWork } from "@/tests/unit/shared/factories/work";
import type { WorkPage } from "@/types/api";

type Repository = typeof moderationRepository;

const mockPendingWorks = jest.fn<
  ReturnType<Repository["pendingWorks"]>,
  Parameters<Repository["pendingWorks"]>
>();
const mockAccept = jest.fn<
  ReturnType<Repository["accept"]>,
  Parameters<Repository["accept"]>
>();
const mockRefuse = jest.fn<
  ReturnType<Repository["refuse"]>,
  Parameters<Repository["refuse"]>
>();

jest.mock("@/repositories", () => ({
  moderationRepository: {
    pendingWorks: (...args: Parameters<typeof mockPendingWorks>) =>
      mockPendingWorks(...args),
    accept: (...args: Parameters<typeof mockAccept>) => mockAccept(...args),
    refuse: (...args: Parameters<typeof mockRefuse>) => mockRefuse(...args),
  },
}));

describe("useModeration", () => {
  it.each([
    {
      action: "accept",
      run: (hook: ReturnType<typeof useModeration>) => hook.accept(1),
    },
    {
      action: "refuse",
      run: (hook: ReturnType<typeof useModeration>) => hook.refuse(1),
    },
  ])("$action removes the work from the pending list", async ({ run }) => {
    const page: WorkPage = {
      items: [buildWork({ id: 1 }), buildWork({ id: 2 })],
      page: 1,
      pageSize: 20,
      total: 2,
    };
    mockPendingWorks.mockResolvedValue(page);
    mockAccept.mockResolvedValue(page.items[0]);
    mockRefuse.mockResolvedValue(page.items[0]);

    const { result } = renderHook(() => useModeration());

    await act(async () => {
      await result.current.pendingWorks();
    });
    await act(async () => {
      await run(result.current);
    });

    expect(result.current.pending?.items.map((work) => work.id)).toEqual([2]);
  });
});
