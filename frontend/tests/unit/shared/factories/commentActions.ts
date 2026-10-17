import type { CommentActions } from "@/app/comments/_components/commentItem";

export function buildCommentActions(
  overrides: Partial<CommentActions> = {},
): CommentActions {
  return {
    reply: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}
