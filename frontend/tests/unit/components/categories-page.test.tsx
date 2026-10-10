/** @jest-environment jsdom */

import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "@jest/globals";
import CategoryPage from "@/app/categories/page";
import { cat, categoryActions, mockCategoriesState } from "../mocks/categories";
import { lastCategoryViewProps } from "../mocks/views";

jest.mock(
  "@/contexts/categoryContext",
  () =>
    jest.requireActual<typeof import("../mocks/categories")>(
      "../mocks/categories",
    ).categoryContextModule,
);
jest.mock(
  "@/components/guards/loadingGuard",
  () =>
    jest.requireActual<typeof import("../mocks/guards")>("../mocks/guards")
      .loadingGuardModule,
);
jest.mock(
  "@/app/categories/_components/noCategory",
  () =>
    jest.requireActual<typeof import("../mocks/ui")>("../mocks/ui")
      .noCategoryModule,
);
jest.mock(
  "@/app/categories/_components/categoryView",
  () =>
    jest.requireActual<typeof import("../mocks/views")>("../mocks/views")
      .categoryViewModule,
);

const { list } = categoryActions;

function setup() {
  mockCategoriesState([]);
  return render(<CategoryPage />);
}

describe("CategoryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    list.mockResolvedValue([cat(3, "Peinture"), cat(4, "Sculpture")]);
  });

  it("shows the loading guard while the category list is pending", () => {
    list.mockReturnValue(new Promise(() => {}));
    setup();
    expect(screen.getByTestId("loading")).toBeDefined();
  });

  it("loads the categories once and renders the view for the first one", async () => {
    setup();
    expect(await screen.findByTestId("category-view")).toBeDefined();
    expect(list).toHaveBeenCalledTimes(1);
    expect(lastCategoryViewProps().categoryId).toBe(3);
  });

  it("switches the view to the category chosen in the header", async () => {
    setup();
    await screen.findByTestId("category-view");

    act(() => lastCategoryViewProps().onCategoryChange("4"));
    expect(lastCategoryViewProps().categoryId).toBe(4);
    expect(list).toHaveBeenCalledTimes(1);
  });

  it.each<[string, () => void]>([
    [
      "resolves with an empty array",
      () => {
        list.mockResolvedValue([]);
      },
    ],
    [
      "resolves with nothing",
      () => {
        list.mockResolvedValue(undefined);
      },
    ],
    [
      "rejects",
      () => {
        list.mockRejectedValue(new Error("500"));
      },
    ],
  ])("shows NoCategory when list %s", async (_label, arrange) => {
    arrange();
    setup();
    expect(await screen.findByTestId("no-category")).toBeDefined();
    expect(screen.queryByTestId("category-view")).toBeNull();
  });
});
