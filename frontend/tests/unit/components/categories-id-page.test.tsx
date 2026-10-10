/** @jest-environment jsdom */

import React from "react";
import { render, act } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "@jest/globals";
import WorksByCategory from "@/app/categories/[id]/page";
import { mockPush, mockRouteParams } from "../mocks/navigation";
import { lastCategoryViewProps } from "../mocks/views";

jest.mock(
  "next/navigation",
  () =>
    jest.requireActual<typeof import("../mocks/navigation")>(
      "../mocks/navigation",
    ).navigationModule,
);
jest.mock(
  "@/app/categories/_components/categoryView",
  () =>
    jest.requireActual<typeof import("../mocks/views")>("../mocks/views")
      .categoryViewModule,
);

describe("WorksByCategory (route page)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("passes the route id to the view as a number", () => {
    mockRouteParams({ id: "42" });
    render(<WorksByCategory />);
    expect(lastCategoryViewProps().categoryId).toBe(42);
  });

  it("navigates to the chosen category", () => {
    mockRouteParams({ id: "1" });
    render(<WorksByCategory />);
    act(() => lastCategoryViewProps().onCategoryChange("5"));
    expect(mockPush).toHaveBeenCalledWith("/categories/5");
  });
});
