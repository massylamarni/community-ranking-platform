/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "@jest/globals";
import { WorkList } from "@/app/works/_components/workList";
import type { Work } from "@/types/api";
import { createWork } from "../utils";
import { workItemPropsFor } from "../mocks/views";

jest.mock(
  "@/app/works/_components/workItem",
  () =>
    jest.requireActual<typeof import("../mocks/views")>("../mocks/views")
      .workItemModule,
);
jest.mock(
  "@/app/works/_components/categoryHasNoWork",
  () =>
    jest.requireActual<typeof import("../mocks/views")>("../mocks/views")
      .noWorkModule,
);
jest.mock(
  "@/app/works/_components/worksContainer",
  () =>
    jest.requireActual<typeof import("../mocks/views")>("../mocks/views")
      .worksContainerModule,
);

const setWorks = jest.fn();

function setup(works: Work[], username?: string) {
  return render(
    <WorkList
      works={works}
      setWorks={setWorks}
      setSelectedWork={jest.fn()}
      username={username}
    />,
  );
}

describe("WorkList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the empty state instead of the container when there are no works", () => {
    setup([]);
    expect(screen.getByTestId("no-work")).toBeDefined();
    expect(screen.queryByTestId("container")).toBeNull();
  });

  it.each<[string, string | undefined, boolean[]]>([
    ["a logged-in user: no vote on their own work", "alice", [false, true]],
    ["a logged-out visitor: vote on every work", undefined, [true, true]],
  ])("for %s", (_label, username, canVote) => {
    setup([createWork(1, "alice"), createWork(2, "bob")], username);
    expect(typeof workItemPropsFor(1).setWork === "function").toBe(canVote[0]);
    expect(typeof workItemPropsFor(2).setWork === "function").toBe(canVote[1]);
  });

  it("replaces only the matching work when setWork is called", () => {
    const works = [createWork(1, "alice"), createWork(2, "bob")];
    setup(works, "alice");
    const updated = createWork(2, "bob", { totalVotes: 5 });
    workItemPropsFor(2).setWork!(updated);

    const updater = setWorks.mock.calls[0][0] as (prev: Work[]) => Work[];
    expect(updater(works)).toEqual([works[0], updated]);
  });
});
