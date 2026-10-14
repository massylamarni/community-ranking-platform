import { describe, expect, it } from "@jest/globals";
import { normalizeWorkResponse } from "@/repositories/works.repository";
import type { WorkResponse } from "@/types/api";

describe("normalizeWorkResponse", () => {
  it("maps an API response to the frontend work model", () => {
    const response: WorkResponse = {
      id: 42,
      title: "The Left Hand of Darkness",
      description: "A science-fiction novel",
      status: "approved",
      author: "ursula",
      imageUrl: null,
      categories: ["Science-fiction"],
      totalVotes: 7,
    };

    expect(normalizeWorkResponse(response)).toEqual({
      id: 42,
      title: "The Left Hand of Darkness",
      description: "A science-fiction novel",
      status: "approved",
      author: "ursula",
      imageUrl: null,
      categories: ["Science-fiction"],
      totalVotes: 7,
    });
  });
});
