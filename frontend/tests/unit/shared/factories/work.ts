import type { Work } from "@/types/api";

/**
 * `score` defaults to 0 (a votable work).
 * `score: undefined` work that cannot be voted on.
 */
export function buildWork(overrides: Partial<Work> = {}): Work {
  return {
    id: 1,
    title: "Test work",
    description: "A test description",
    imageUrl: null,
    author: "alice",
    categories: [],
    status: "approved",
    score: 0,
    totalVotes: 0,
    ...overrides,
  };
}
