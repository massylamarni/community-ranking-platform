/** @jest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { WorkItem } from "@/app/works/_components/workItem";
import type { Work } from "@/types/api";
import { describe, expect, it } from "@jest/globals";

describe("WorkItem", () => {
  it("renders the work and reports when it is selected", () => {
    const work: Work = {
      id: 42,
      title: "Component test work",
      description: "A rendered work item",
      imageUrl: null,
      author: { username: "alice" },
      categories: [],
      status: "approved",
      totalVotes: 3,
    };
    const setSelectedWork = jest.fn();

    render(<WorkItem work={work} setSelectedWork={setSelectedWork} />);

    expect(screen.getByText(work.title)).toBeDefined();
    expect(screen.getByText(work.description)).toBeDefined();
    expect(screen.getByText("alice")).toBeDefined();

    fireEvent.click(screen.getByText(work.title));

    expect(setSelectedWork).toHaveBeenCalledWith(work);
  });
});
