/** @jest-environment jsdom */

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "@jest/globals";
import AuthorWorkGuard from "@/app/works/_components/guards/authorWorkGuard";
import type { Work } from "@/types/api";
import { createWork, deferred } from "../../../shared/utils";
import { mockUser } from "../../../shared/mocks/auth";
import { mockWorksState, workActions } from "../../../shared/mocks/works";

jest.mock(
  "@/hooks/use-auth",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/auth")>(
      "../../../shared/mocks/auth",
    ).authModule,
);
jest.mock(
  "@/hooks/use-work",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/works")>(
      "../../../shared/mocks/works",
    ).useWorksModule,
);
jest.mock(
  "@/components/guards/loadingGuard",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/guards")>(
      "../../../shared/mocks/guards",
    ).loadingGuardModule,
);
jest.mock(
  "@/app/works/_components/guards/workNotFoundGuard",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/guards")>(
      "../../../shared/mocks/guards",
    ).workNotFoundGuardModule,
);
jest.mock(
  "@/app/works/_components/guards/authorGuard",
  () =>
    jest.requireActual<typeof import("../../../shared/mocks/guards")>(
      "../../../shared/mocks/guards",
    ).authorGuardModule,
);

const { get } = workActions;
const mockChildren = jest.fn();

const renderChild = (work: Work, error: unknown) => {
  mockChildren(work, error);
  return <div data-testid="child" />;
};

function setup({
  id = 1,
  username = "alice" as string | null,
  work = null as Work | null,
} = {}) {
  mockUser(username);
  mockWorksState(work);
  return render(<AuthorWorkGuard id={id}>{renderChild}</AuthorWorkGuard>);
}

describe("AuthorWorkGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    get.mockResolvedValue(undefined);
  });

  it("shows the loading guard while the request is pending", () => {
    get.mockReturnValue(new Promise(() => {}));
    setup({ work: createWork(1, "alice") });
    expect(screen.getByTestId("loading")).toBeDefined();
    expect(screen.queryByTestId("child")).toBeNull();
  });

  it("shows not-found when there is no work after loading", async () => {
    setup({ work: null });
    expect(await screen.findByTestId("not-found")).toBeDefined();
    expect(screen.queryByTestId("not-author")).toBeNull();
  });

  it("shows not-found when get rejects and there is no work", async () => {
    get.mockRejectedValue(new Error("500"));
    setup({ work: null });
    expect(await screen.findByTestId("not-found")).toBeDefined();
    expect(screen.queryByTestId("loading")).toBeNull();
  });

  it.each<[string, string | null]>([
    ["logged out", null],
    ["not the author", "bob"],
  ])("shows the author guard when %s", async (_label, username) => {
    setup({ username, work: createWork(1, "alice") });
    expect(await screen.findByTestId("not-author")).toBeDefined();
    expect(mockChildren).not.toHaveBeenCalled();
  });

  it("renders the children with the work and no error for the author", async () => {
    const work = createWork(1, "alice");
    setup({ username: "alice", work });
    expect(await screen.findByTestId("child")).toBeDefined();
    expect(mockChildren).toHaveBeenLastCalledWith(work, null);
  });

  it("passes the fetch error to the children when a work is in the store", async () => {
    const err = { message: "boom" };
    const work = createWork(1, "alice");
    get.mockRejectedValue(err);
    setup({ work });
    expect(await screen.findByTestId("child")).toBeDefined();
    expect(mockChildren).toHaveBeenLastCalledWith(work, err);
  });

  it("refetches when the id changes", async () => {
    const { rerender } = setup({ id: 1, work: createWork(1, "alice") });
    await screen.findByTestId("child");

    rerender(<AuthorWorkGuard id={2}>{renderChild}</AuthorWorkGuard>);
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
    expect(get).toHaveBeenNthCalledWith(1, 1);
    expect(get).toHaveBeenNthCalledWith(2, 2);
  });

  it("ignores a stale response when the id changes mid-request", async () => {
    const first = deferred<void>();
    const second = deferred<void>();
    get.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    const { rerender } = setup({ id: 1, work: createWork(1, "alice") });
    rerender(<AuthorWorkGuard id={2}>{renderChild}</AuthorWorkGuard>);
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));

    await act(async () => first.resolve());
    expect(screen.getByTestId("loading")).toBeDefined();

    await act(async () => second.resolve());
    expect(await screen.findByTestId("child")).toBeDefined();
  });
});
