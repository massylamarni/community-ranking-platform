/**
 * @jest-environment jsdom
 */
import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommentSection } from "@/app/comments/_components/commentSection";
import { buildCommentPage } from "@/tests/unit/shared/factories/commentPage";
import { buildUseComments } from "@/tests/unit/shared/factories/useComments";
import { mockCommentForm } from "@/tests/unit/shared/mocks/commentForm";
import { mockUseComments } from "@/tests/unit/shared/mocks/useComments";

jest.mock("@/hooks/use-comments", () => ({
  useComments: () => mockUseComments(),
}));
jest.mock("@/app/comments/_components/commentForm", () => ({
  CommentForm: () => mockCommentForm(),
}));

type Props = ComponentProps<typeof CommentSection>;

function renderSection(props: Partial<Props> = {}) {
  return render(
    <CommentSection
      workId={42}
      workAuthor="alice"
      currentUser="bob"
      {...props}
    />,
  );
}

describe("CommentSection", () => {
  let hook: ReturnType<typeof buildUseComments>;

  beforeEach(() => {
    hook = buildUseComments();
    mockUseComments.mockReturnValue(hook);
  });

  describe("access rules", () => {
    it("asks logged-out users to log in and shows no comment form", () => {
      renderSection({ currentUser: null });

      expect(screen.getByText("Log in to join the discussion.")).not.toBeNull();
      expect(screen.queryByRole("form", { name: "Comment form" })).toBeNull();
    });

    it.each([
      { who: "the work's author", currentUser: "alice", canComment: false },
      { who: "another logged-in user", currentUser: "bob", canComment: true },
    ])(
      "top-level comment form shown: $canComment for $who",
      ({ currentUser, canComment }) => {
        renderSection({ currentUser });

        const form = screen.queryByRole("form", { name: "Comment form" });
        const ownWorkMessage = screen.queryByText(
          /can't add a top-level comment on your own work/,
        );

        expect(form !== null).toBe(canComment);
        expect(ownWorkMessage !== null).toBe(!canComment);
      },
    );
  });

  describe("data loading", () => {
    it("loads comments on mount and again when workId changes", () => {
      const { rerender } = renderSection({ workId: 42 });

      expect(hook.list).toHaveBeenCalledTimes(1);
      expect(hook.list).toHaveBeenLastCalledWith(42);

      rerender(
        <CommentSection workId={43} workAuthor="alice" currentUser="bob" />,
      );

      expect(hook.list).toHaveBeenCalledTimes(2);
      expect(hook.list).toHaveBeenLastCalledWith(43);
    });

    it("keeps the current pageSize when changing page", async () => {
      hook = buildUseComments({
        commentPage: buildCommentPage({ page: 2, pageSize: 10, total: 35 }),
      });
      mockUseComments.mockReturnValue(hook);

      renderSection({ workId: 42 });
      await userEvent.click(screen.getByRole("button", { name: "Next" }));

      expect(hook.list).toHaveBeenLastCalledWith(42, 3, 10);
    });
  });
});
