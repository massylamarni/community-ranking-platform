/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "@jest/globals";
import { WorkList } from "@/app/works/_components/workList";
import type { Work } from "@/types/api";
import { createWork } from "../utils";

const mockWorkItem = jest.fn();
const setWorks = jest.fn();

jest.mock("@/app/works/_components/workItem", () => ({
  WorkItem: (props: unknown) => {
    mockWorkItem(props);
    return <div data-testid="work-item" />;
  },
}));

jest.mock("@/app/works/_components/categoryHasNoWork", () => ({
  __esModule: true,
  default: () => <div data-testid="no-work" />,
}));

jest.mock("@/app/works/_components/worksContainer", () => ({
  WorksContainer: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="container">{children}</div>
  ),
}));

const propsFor = (id: number) =>
  mockWorkItem.mock.calls.map((c) => c[0]).find((p) => p.work.id === id);

describe("WorkList", () => {
  beforeEach(() => {
    mockWorkItem.mockClear();
  });

  it("renders the empty state when there are no works", () => {
    render(
      <WorkList
        works={[]}
        setWorks={jest.fn()}
        setSelectedWork={jest.fn()}
        username="alice"
      />,
    );
    expect(screen.getByTestId("no-work")).toBeDefined();
    expect(screen.queryByTestId("container")).toBeNull();
  });

  it("renders one WorkItem per work", () => {
    render(
      <WorkList
        works={[createWork(1), createWork(2), createWork(3)]}
        setWorks={jest.fn()}
        setSelectedWork={jest.fn()}
        username="alice"
      />,
    );
    expect(screen.getAllByTestId("work-item")).toHaveLength(3);
    expect(screen.queryByTestId("no-work")).toBeNull();
  });

  it("does not give setWork to the author's own works (disallow vote)", () => {
    render(
      <WorkList
        works={[createWork(1, "alice"), createWork(2, "bob")]}
        setWorks={jest.fn()}
        setSelectedWork={jest.fn()}
        username="alice"
      />,
    );
    expect(propsFor(1).setWork).toBeUndefined();
    expect(typeof propsFor(2).setWork).toBe("function");
  });

  it("gives setWork to every work when logged out", () => {
    render(
      <WorkList
        works={[createWork(1)]}
        setWorks={jest.fn()}
        setSelectedWork={jest.fn()}
        username={undefined}
      />,
    );
    expect(typeof propsFor(1).setWork).toBe("function");
  });

  it("replaces only the matching work when setWork is called", () => {
    const works = [createWork(1, "alice"), createWork(2, "bob")];
    render(
      <WorkList
        works={works}
        setWorks={setWorks}
        setSelectedWork={jest.fn()}
        username="alice"
      />,
    );
    const updated = createWork(2, "bob", { totalVotes: 5 });
    propsFor(2).setWork(updated);

    const updater = setWorks.mock.calls[0][0] as (prev: Work[]) => Work[];
    expect(updater(works)).toEqual([works[0], updated]);
  });
});
