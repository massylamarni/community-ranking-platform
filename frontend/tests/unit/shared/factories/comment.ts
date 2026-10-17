import type { Comment } from "@/types/api";

export function buildComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 1,
    content: "A test comment",
    imageUrl: null,
    author: { username: "alice" },
    username: "alice",
    parentCommentId: null,
    oeuvreId: "1",
    replies: [],
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}
