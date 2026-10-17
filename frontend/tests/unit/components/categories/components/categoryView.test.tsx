/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "@jest/globals";
import CategoryView from "@/app/categories/_components/categoryView";
import type { Work } from "@/types/api";
import { createWork, deferred } from "../../../shared/utils";
import { mockUser } from "../../../shared/mocks/auth";
import {
  cat,
  categoryActions,
  mockCategoriesState,
} from "../../../shared/mocks/categories";
import {
  lastFilterBarProps,
  lastWorkItemProps,
  lastWorkListProps,
} from "../../../shared/mocks/views";

jest.mock(
  "next/link",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/ui")>(
      "../../../shared/mocks/ui",
    ).linkModule,
);
jest.mock(
  "@/components/ui/button",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/ui")>(
      "../../../shared/mocks/ui",
    ).buttonModule,
);
jest.mock(
  "@/components/ui/dialog",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/ui")>(
      "../../../shared/mocks/ui",
    ).dialogModule,
);
jest.mock(
  "@/components/header-portal",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/ui")>(
      "../../../shared/mocks/ui",
    ).headerPortalModule,
);
jest.mock(
  "@/hooks/use-auth",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/auth")>(
      "../../../shared/mocks/auth",
    ).authModule,
);
jest.mock(
  "@/contexts/categoryContext",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/categories")>(
      "../../../shared/mocks/categories",
    ).categoryContextModule,
);
jest.mock(
  "@/components/guards/loadingGuard",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/guards")>(
      "../../../shared/mocks/guards",
    ).loadingGuardModule,
);
jest.mock(
  "@/app/categories/_components/guards/categoryNotFoundGuard",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/guards")>(
      "../../../shared/mocks/guards",
    ).categoryNotFoundGuardModule,
);
jest.mock(
  "@/app/categories/_components/filterBar",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/views")>(
      "../../../shared/mocks/views",
    ).filterBarModule,
);
jest.mock(
  "@/app/works/_components/workList",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/views")>(
      "../../../shared/mocks/views",
    ).workListModule,
);
jest.mock(
  "@/app/works/_components/workItem",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/views")>(
      "../../../shared/mocks/views",
    ).workItemModule,
);

const { getById, worksOf } = categoryActions;
const onCategoryChange = jest.fn();

const ui = (categoryId: number) => (
  <CategoryView categoryId={categoryId} onCategoryChange={onCategoryChange} />
);

function setup({
  categoryId = 1,
  username = "alice" as string | null,
  admin = false,
  cats = [cat(1, "Peinture")],
} = {}) {
  mockUser(username, { admin });
  mockCategoriesState(cats);
  return render(ui(categoryId));
}

const loaded = () => screen.findByTestId("work-list");

// Opens the dialog on a work written by `author`
async function openWork(author: string, username: string | null) {
  const work = createWork(1, author);
  worksOf.mockResolvedValue({ items: [work] });
  setup({ username });
  await loaded();
  act(() => lastWorkListProps().setSelectedWork(work));
  return work;
}

describe("CategoryView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getById.mockResolvedValue(undefined);
    worksOf.mockResolvedValue({ items: [] });
  });

  it("shows the loading guard while the request is pending", () => {
    getById.mockReturnValue(new Promise(() => {}));
    setup();
    expect(screen.getByTestId("loading")).toBeDefined();
    expect(screen.queryByTestId("work-list")).toBeNull();
  });

  it.each([NaN, 0])(
    "shows not-found without fetching when categoryId is %p",
    async (categoryId) => {
      setup({ categoryId });
      expect(await screen.findByTestId("not-found")).toBeDefined();
      expect(getById).not.toHaveBeenCalled();
    },
  );

  it("shows not-found when getById rejects, without fetching works", async () => {
    getById.mockRejectedValue(new Error("404"));
    setup();
    expect(await screen.findByTestId("not-found")).toBeDefined();
    expect(worksOf).not.toHaveBeenCalled();
  });

  it("fetches the works, and refetches them when the category changes", async () => {
    const first = [createWork(1, "bob")];
    const second = [createWork(10, "bob")];
    worksOf
      .mockResolvedValueOnce({ items: first })
      .mockResolvedValueOnce({ items: second });
    const { rerender } = setup({ categoryId: 1 });
    await loaded();
    expect(getById).toHaveBeenNthCalledWith(1, 1);
    expect(worksOf).toHaveBeenNthCalledWith(1, 1);
    expect(lastWorkListProps().works).toEqual(first);

    rerender(ui(2));
    expect(screen.getByTestId("loading")).toBeDefined();
    await loaded();
    expect(getById).toHaveBeenNthCalledWith(2, 2);
    expect(worksOf).toHaveBeenNthCalledWith(2, 2);
    expect(lastWorkListProps().works).toEqual(second);
  });

  it("ignores a stale response when the id changes mid-request", async () => {
    const first = deferred<{ items: Work[] }>();
    const second = deferred<{ items: Work[] }>();
    worksOf
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const { rerender } = setup({ categoryId: 1 });
    rerender(ui(2));
    await act(async () => {});

    const fresh = [createWork(20, "bob")];
    await act(async () => second.resolve({ items: fresh }));
    await loaded();
    await act(async () => first.resolve({ items: [createWork(10, "bob")] }));
    expect(lastWorkListProps().works).toEqual(fresh);
  });

  describe("header", () => {
    it("gives the FilterBar the categories and the current id as a string", async () => {
      const cats = [cat(1, "Peinture"), cat(2, "Sculpture")];
      setup({ categoryId: 2, cats });
      await loaded();
      expect(lastFilterBarProps()).toMatchObject({
        categoryId: "2",
        categories: cats,
      });
    });

    it("hides the FilterBar when there are no categories", async () => {
      setup({ cats: [] });
      await loaded();
      expect(screen.queryByTestId("filter-bar")).toBeNull();
    });

    it("reports the chosen category and closes the open work", async () => {
      await openWork("bob", "alice");
      expect(screen.getByTestId("dialog")).toBeDefined();

      fireEvent.click(screen.getByTestId("filter-bar"));
      expect(onCategoryChange).toHaveBeenCalledWith("5");
      expect(screen.queryByTestId("dialog")).toBeNull();
    });

    it.each([
      ["admins", true, "/categories/edit"],
      ["non-admins", false, undefined],
    ])("Edit link for %s", async (_label, admin, href) => {
      setup({ admin });
      await loaded();
      expect(
        screen.queryByText("Edit")?.closest("a")?.getAttribute("href"),
      ).toBe(href);
    });
  });

  describe("selected work dialog", () => {
    it("closes when the dialog requests it", async () => {
      await openWork("bob", "alice");
      fireEvent.click(screen.getByTestId("close-dialog"));
      expect(screen.queryByTestId("dialog")).toBeNull();
    });

    it.each<[string, string | null, boolean]>([
      ["the author", "alice", true],
      ["another user", "bob", false],
      ["a logged-out visitor", null, false],
    ])(
      "for %s: manage section and voting",
      async (_label, username, isAuthor) => {
        const work = await openWork("alice", username);
        expect(lastWorkItemProps().work).toEqual(work);
        expect(lastWorkItemProps().setWork === undefined).toBe(isAuthor);
        expect(!!screen.queryByText("Manage this work")).toBe(isAuthor);
      },
    );

    it("replaces only the matching work when setWork is called", async () => {
      const a = createWork(1, "bob");
      const b = createWork(2, "bob");
      worksOf.mockResolvedValue({ items: [a, b] });
      setup({ username: "alice" });
      await loaded();

      act(() => lastWorkListProps().setSelectedWork(b));
      const updated = createWork(2, "bob", { totalVotes: 9 });
      act(() => lastWorkItemProps().setWork!(updated));

      expect(lastWorkListProps().works).toEqual([a, updated]);
      expect(lastWorkItemProps().work).toEqual(updated);
    });
  });
});
