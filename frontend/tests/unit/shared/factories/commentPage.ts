import type { CommentPage } from "@/types/api";

export function buildCommentPage(
  overrides: Partial<CommentPage> = {},
): CommentPage {
  return {
    items: [],
    page: 1,
    pageSize: 20,
    total: 0,
    ...overrides,
  };
}
