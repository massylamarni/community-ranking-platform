/** @jest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { worksRepository } from "@/repositories";
import { useWorks } from "@/hooks/use-work";
import type { Work } from "@/types/api";
import { describe, expect, it } from "@jest/globals";

jest.mock("@/repositories", () => ({
  worksRepository: { create: jest.fn() },
}));

describe("useWorks", () => {
  it("stores the work returned when a draft is created", async () => {
    const createdWork: Work = {
      id: 42,
      title: "Hook test work",
      description: "Created through the hook",
      imageUrl: null,
      author: { id: 2, username: "alice" },
      categories: [],
      status: "created",
      score: 0,
      totalVotes: 0,
    };
    const createMock = worksRepository.create as jest.Mock;
    createMock.mockResolvedValue(createdWork);

    const { result } = renderHook(() => useWorks());

    await act(async () => {
      await result.current.create({
        title: createdWork.title,
        description: createdWork.description,
      });
    });

    expect(createMock).toHaveBeenCalledWith({
      title: createdWork.title,
      description: createdWork.description,
    });
    expect(result.current.work).toEqual(createdWork);
  });
});
