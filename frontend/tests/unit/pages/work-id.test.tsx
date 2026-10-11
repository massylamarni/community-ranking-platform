/** @jest-environment jsdom */

import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "@jest/globals";
import type { ComponentProps } from "react";
import DisplayWork from "@/app/works/[id]/page";
import type { WorkItem } from "@/app/works/_components/workItem";
import type { Work } from "@/types/api";
import { createWork } from "../utils";

type WorkItemProps = ComponentProps<typeof WorkItem>;

let mockParams = { id: "5" };
let mockUser: { username: string } | null | undefined = { username: "alice" };
let mockWork: Work | null = null;
const mockGet = jest.fn();
const mockWorkItem = jest.fn();

jest.mock("next/navigation", () => ({
  useParams: () => mockParams,
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

jest.mock("@/hooks/use-work", () => ({
  useWorks: () => ({ work: mockWork, get: mockGet }),
}));

jest.mock("@/components/guards/loadingGuard", () => ({
  __esModule: true,
  default: () => <div data-testid="loading" />,
}));

jest.mock("@/app/works/_components/guards/workNotFoundGuard", () => ({
  __esModule: true,
  default: () => <div data-testid="not-found" />,
}));

jest.mock("@/app/works/_components/guards/authorGuard", () => ({
  __esModule: true,
  default: () => <div data-testid="not-author" />,
}));

jest.mock("@/app/works/_components/workItem", () => ({
  WorkItem: (props: WorkItemProps) => {
    mockWorkItem(props);
    return <div data-testid="work-item" />;
  },
}));

function deferred<T = void>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("DisplayWork", () => {
  beforeEach(() => {
    mockParams = { id: "5" };
    mockUser = { username: "alice" };
    mockWork = createWork(5, "alice");
    mockGet.mockReset();
    mockGet.mockResolvedValue(undefined);
    mockWorkItem.mockClear();
  });

  describe("fetching", () => {
    it("fetches the work with the numeric id from the URL", async () => {
      render(<DisplayWork />);
      await screen.findByTestId("work-item");
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(5);
    });

    it("fetches again when the id changes", async () => {
      const { rerender } = render(<DisplayWork />);
      await screen.findByTestId("work-item");

      mockParams = { id: "6" };
      rerender(<DisplayWork />);

      await waitFor(() => expect(mockGet).toHaveBeenCalledWith(6));
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });

  describe("loading", () => {
    it("shows the loading guard while the request is pending", () => {
      mockGet.mockReturnValue(deferred().promise);
      render(<DisplayWork />);
      expect(screen.getByTestId("loading")).toBeDefined();
    });

    it("prefers loading over a work already in the store", () => {
      // work is present (e.g. from a previous page) but the fetch isn't done
      mockGet.mockReturnValue(deferred().promise);
      render(<DisplayWork />);
      expect(screen.getByTestId("loading")).toBeDefined();
      expect(screen.queryByTestId("work-item")).toBeNull();
    });

    it("leaves the loading state once the request resolves", async () => {
      const d = deferred();
      mockGet.mockReturnValue(d.promise);
      render(<DisplayWork />);

      await act(async () => d.resolve());

      expect(screen.queryByTestId("loading")).toBeNull();
      expect(screen.getByTestId("work-item")).toBeDefined();
    });

    it("leaves the loading state when the request fails", async () => {
      mockWork = null;
      mockGet.mockRejectedValue(new Error("boom"));
      render(<DisplayWork />);

      expect(await screen.findByTestId("not-found")).toBeDefined();
      expect(screen.queryByTestId("loading")).toBeNull();
    });
  });

  describe("guards", () => {
    it("shows not-found when there is no work", async () => {
      mockWork = null;
      render(<DisplayWork />);
      expect(await screen.findByTestId("not-found")).toBeDefined();
    });

    it("shows the author guard when the user is not the author", async () => {
      mockWork = createWork(5, "bob");
      render(<DisplayWork />);
      expect(await screen.findByTestId("not-author")).toBeDefined();
      expect(screen.queryByTestId("work-item")).toBeNull();
    });

    it("shows the author guard when logged out", async () => {
      mockUser = null;
      render(<DisplayWork />);
      expect(await screen.findByTestId("not-author")).toBeDefined();
    });

    it("checks not-found before the author guard", async () => {
      mockWork = null;
      mockUser = null;
      render(<DisplayWork />);
      expect(await screen.findByTestId("not-found")).toBeDefined();
      expect(screen.queryByTestId("not-author")).toBeNull();
    });
  });

  describe("author view", () => {
    it("renders the WorkItem with the work for its author", async () => {
      render(<DisplayWork />);
      await screen.findByTestId("work-item");

      expect(mockWorkItem).toHaveBeenCalled();
      const props = mockWorkItem.mock.calls[0][0];
      expect(props.work).toEqual(mockWork);
      expect(props.setWork).toBeUndefined();
    });
  });

  describe("stale requests", () => {
    it("ignores a response for an id that is no longer current", async () => {
      const first = deferred();
      const second = deferred();
      mockGet.mockImplementation((id: number) =>
        id === 5 ? first.promise : second.promise,
      );

      const { rerender } = render(<DisplayWork />);
      mockParams = { id: "6" };
      rerender(<DisplayWork />);

      // The old request finishes first: it must not end the loading state.
      await act(async () => first.resolve());
      expect(screen.getByTestId("loading")).toBeDefined();

      // The current request finishes: now loading ends.
      await act(async () => second.resolve());
      expect(screen.queryByTestId("loading")).toBeNull();
    });

    it("ignores a failure for an id that is no longer current", async () => {
      const first = deferred();
      const second = deferred();
      mockGet.mockImplementation((id: number) =>
        id === 5 ? first.promise : second.promise,
      );

      const { rerender } = render(<DisplayWork />);
      mockParams = { id: "6" };
      rerender(<DisplayWork />);

      await act(async () => first.reject(new Error("old failure")));
      expect(screen.getByTestId("loading")).toBeDefined();

      await act(async () => second.resolve());
      expect(screen.queryByTestId("loading")).toBeNull();
    });

    it("does not throw when the component unmounts mid-request", async () => {
      const d = deferred();
      mockGet.mockReturnValue(d.promise);
      const { unmount } = render(<DisplayWork />);

      unmount();
      await act(async () => d.resolve());

      expect(screen.queryByTestId("loading")).toBeNull();
    });
  });
});
