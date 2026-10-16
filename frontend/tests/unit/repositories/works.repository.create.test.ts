import { request } from "@/lib/http";
import { worksRepository } from "@/repositories/works.repository";
import type { WorkResponse } from "@/types/api";
import { describe, expect, it } from "@jest/globals";

jest.mock("@/lib/http", () => ({ request: jest.fn() }));

describe("worksRepository.create", () => {
  it("sends the draft payload and normalizes the API response", async () => {
    const response: WorkResponse = {
      id: 42,
      title: "Unit test work",
      description: "A draft",
      status: "created",
      reason: "",
      author: "alice",
      imageUrl: null,
      categories: [],
      totalVotes: 0,
    };
    const requestMock = request as jest.Mock;
    requestMock.mockResolvedValue(response);

    const result = await worksRepository.create({
      title: "Unit test work",
      description: "A draft",
      imageUrl: null,
    });

    expect(requestMock).toHaveBeenCalledWith("/works", {
      method: "POST",
      body: {
        title: "Unit test work",
        description: "A draft",
        imageUrl: null,
      },
    });
    expect(result.author).toEqual("alice");
    expect(result.status).toBe("created");
  });
});
