/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { useComments } from "@/hooks/use-comments";
import { buildComment } from "@/tests/unit/shared/factories/comment";
import { buildCommentPage } from "@/tests/unit/shared/factories/commentPage";
import { mockCommentsRepository } from "@/tests/unit/shared/mocks/repositories/commentsRepository";

jest.mock("@/repositories", () => ({
  commentsRepository: {
    list: (...a: Parameters<typeof mockCommentsRepository.list>) =>
      mockCommentsRepository.list(...a),
    create: (...a: Parameters<typeof mockCommentsRepository.create>) =>
      mockCommentsRepository.create(...a),
    update: (...a: Parameters<typeof mockCommentsRepository.update>) =>
      mockCommentsRepository.update(...a),
    remove: (...a: Parameters<typeof mockCommentsRepository.remove>) =>
      mockCommentsRepository.remove(...a),
  },
}));

type Hook = ReturnType<typeof useComments>;

async function renderAfterList(...args: Parameters<Hook["list"]>) {
  const hook = renderHook(() => useComments());
  await act(async () => {
    await hook.result.current.list(...args);
  });
  mockCommentsRepository.list.mockClear();
  return hook;
}

describe("useComments", () => {
  beforeEach(() => {
    mockCommentsRepository.list.mockResolvedValue(buildCommentPage());
    mockCommentsRepository.create.mockResolvedValue(buildComment());
    mockCommentsRepository.update.mockResolvedValue(buildComment());
    mockCommentsRepository.remove.mockResolvedValue(undefined);
  });

  describe("refetch rules", () => {
    it.each([
      {
        action: "update",
        run: (h: Hook) => h.update(5, { content: "edited" }),
      },
      { action: "remove", run: (h: Hook) => h.remove(5) },
    ])("$action refetches the last requested page", async ({ run }) => {
      const { result } = await renderAfterList(7, 3, 10);

      await act(async () => {
        await run(result.current);
      });

      expect(mockCommentsRepository.list.mock.calls).toEqual([[7, 3, 10]]);
    });

    it.each([
      { target: "the same work as the last list", workId: 7, refetches: true },
      { target: "a different work", workId: 8, refetches: false },
    ])(
      "create on $target refetches: $refetches",
      async ({ workId, refetches }) => {
        const { result } = await renderAfterList(7);

        await act(async () => {
          await result.current.create(workId, { content: "hello" });
        });

        expect(mockCommentsRepository.list.mock.calls).toEqual(
          refetches ? [[7, 1, 20]] : [],
        );
      },
    );
  });
});
