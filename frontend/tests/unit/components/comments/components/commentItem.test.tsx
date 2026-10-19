/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CommentItem,
  type CommentViewer,
} from "@/app/comments/_components/commentItem";
import { buildComment } from "@/tests/unit/shared/factories/comment";
import { buildCommentActions } from "@/tests/unit/shared/factories/commentActions";

function renderItem(
  viewer: CommentViewer,
  comment = buildComment({ author: { id: 2, username: "alice" } }),
) {
  return render(
    <CommentItem
      comment={comment}
      viewer={viewer}
      actions={buildCommentActions()}
    />,
  );
}

const isShown = (name: string) =>
  screen.queryByRole("button", { name }) !== null;

describe("CommentItem", () => {
  describe("action buttons by viewer", () => {
    // The comment is written by "alice"
    it.each([
      {
        who: "an anonymous viewer",
        viewer: { username: null, isAdmin: false },
        canReply: false,
        canEdit: false,
        canDelete: false,
      },
      {
        who: "a logged-in non-author",
        viewer: { username: "bob", isAdmin: false },
        canReply: true,
        canEdit: false,
        canDelete: false,
      },
      {
        who: "the author",
        viewer: { username: "alice", isAdmin: false },
        canReply: true,
        canEdit: true,
        canDelete: true,
      },
      {
        who: "an admin who is not the author",
        viewer: { username: "carol", isAdmin: true },
        canReply: true,
        canEdit: false,
        canDelete: true,
      },
    ])(
      "$who: reply=$canReply edit=$canEdit delete=$canDelete",
      ({ viewer, canReply, canEdit, canDelete }) => {
        renderItem(viewer);

        expect(isShown("Reply")).toBe(canReply);
        expect(isShown("edit-comment")).toBe(canEdit);
        expect(isShown("delete-comment")).toBe(canDelete);
      },
    );
  });

  describe("nested replies", () => {
    it("renders replies with their own author-based permissions", () => {
      const reply = buildComment({
        id: 2,
        content: "A reply",
        author: { id: 3, username: "bob" },
      });
      const parent = buildComment({
        id: 1,
        author: { id: 2, username: "alice" },
        replies: [reply],
      });

      // bob wrote only the reply
      renderItem({ username: "bob", isAdmin: false }, parent);

      // Buttons come in document order: the parent's first, then the reply's.
      // So Edit/Delete appearing after the second Reply means they belong to the reply.
      const buttons = screen
        .getAllByRole("button")
        .map((b) => b.getAttribute("aria-label") ?? b.textContent);

      expect(screen.getByText("A reply")).not.toBeNull();
      expect(buttons).toEqual([
        "Reply",
        "Reply",
        "edit-comment",
        "delete-comment",
      ]);
    });
  });

  describe("edit mode", () => {
    it("swaps the text for a prefilled form and hides the action buttons", async () => {
      const comment = buildComment({
        content: "Original text",
        author: { id: 2, username: "alice" },
      });
      renderItem({ username: "alice", isAdmin: false }, comment);

      await userEvent.click(
        screen.getByRole("button", { name: "edit-comment" }),
      );

      const textbox = screen.getByRole("textbox", {
        name: "comment-text",
      }) as HTMLTextAreaElement;
      expect(textbox.value).toBe("Original text");
      // The static paragraph is gone (selector avoids matching the textarea)
      expect(screen.queryByText("Original text", { selector: "p" })).toBeNull();
      expect(isShown("Reply")).toBe(false);
      expect(isShown("edit-comment")).toBe(false);
      expect(isShown("delete-comment")).toBe(false);
    });
  });
});
