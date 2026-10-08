/** @jest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { WorkItem } from "@/app/works/_components/workItem";
import type { Work } from "@/types/api";
import { describe, expect, it } from "@jest/globals";
import { createWork } from "../utils";

jest.mock("@/app/works/_components/guards/workNotFoundGuard", () => ({
  __esModule: true,
  default: () => <div data-testid="not-found-guard" />,
}));

describe("WorkItem", () => {
  it("renders the work and reports when it is selected", () => {
    const work: Work = createWork();
    const setSelectedWork = jest.fn();

    render(<WorkItem work={work} setSelectedWork={setSelectedWork} />);

    expect(screen.getByText(work.title)).toBeDefined();
    expect(screen.getByText(work.description)).toBeDefined();
    expect(screen.getByText(work.author.username)).toBeDefined();

    fireEvent.click(screen.getByText(work.title));

    expect(setSelectedWork).toHaveBeenCalledWith(work);
  });

  it("renders the not-found guard when work is null", () => {
    render(<WorkItem work={null} />);

    expect(screen.getByTestId("not-found-guard")).toBeDefined();
  });
});
