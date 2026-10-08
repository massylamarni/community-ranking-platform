/** @jest-environment jsdom */

import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "@jest/globals";
import type { ComponentProps } from "react";
import EditWork from "@/app/works/[id]/edit/page";
import type { WorkEdit } from "@/app/works/_components/workEdit";
import type { ApiErrorBody, Category, Work } from "@/types/api";
import { createWork } from "../utils";

type WorkEditProps = ComponentProps<typeof WorkEdit>;

let mockParams = { id: "5" };
let mockUser: { username: string } | null | undefined = { username: "alice" };
let mockWork: Work | null = null;
let mockCategories: Category[] = [];

const mockPush = jest.fn();
const mockGet = jest.fn();
const mockSubmit = jest.fn();
const mockUpdate = jest.fn();
const mockUploadImage = jest.fn();
const mockRemove = jest.fn();
const mockList = jest.fn();
const mockWorkEdit = jest.fn();

jest.mock("next/navigation", () => ({
  useParams: () => mockParams,
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

jest.mock("@/hooks/use-work", () => ({
  useWorks: () => ({
    work: mockWork,
    get: mockGet,
    submit: mockSubmit,
    update: mockUpdate,
    uploadImage: mockUploadImage,
    remove: mockRemove,
  }),
}));

jest.mock("@/contexts/categoryContext", () => ({
  useCategory: () => ({ categories: mockCategories, list: mockList }),
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

jest.mock("@/app/works/_components/workEdit", () => ({
  WorkEdit: (props: WorkEditProps) => {
    mockWorkEdit(props);
    return <div data-testid="work-edit" />;
  },
}));

const apiError: ApiErrorBody = {
  status: 422,
  error: "Validation failed",
  fields: { title: "Titre requis" },
};

function deferred<T = void>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// Props of the most recent WorkEdit render
const latestProps = () =>
  mockWorkEdit.mock.calls[mockWorkEdit.mock.calls.length - 1][0];

async function renderLoaded() {
  render(<EditWork />);
  await screen.findByTestId("work-edit");
}

describe("EditWork", () => {
  beforeEach(() => {
    mockParams = { id: "5" };
    mockUser = { username: "alice" };
    mockWork = createWork(5, "alice");
    mockCategories = [{ id: 1, name: "Movie" }] as Category[];

    [
      mockPush,
      mockGet,
      mockSubmit,
      mockUpdate,
      mockUploadImage,
      mockRemove,
      mockList,
    ].forEach((fn) => fn.mockReset());
    mockWorkEdit.mockClear();

    mockGet.mockResolvedValue(undefined);
    mockList.mockResolvedValue(undefined);
    mockSubmit.mockResolvedValue(undefined);
    mockRemove.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue(createWork(5, "alice", { title: "Updated" }));
  });

  describe("fetching", () => {
    it("loads the categories on mount", async () => {
      await renderLoaded();
      expect(mockList).toHaveBeenCalledTimes(1);
    });

    it("fetches the work with the numeric id from the URL", async () => {
      await renderLoaded();
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(5);
    });

    it("fetches again when the id changes", async () => {
      const { rerender } = render(<EditWork />);
      await screen.findByTestId("work-edit");

      mockParams = { id: "6" };
      rerender(<EditWork />);

      await waitFor(() => expect(mockGet).toHaveBeenCalledWith(6));
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });

  describe("loading and guards", () => {
    it("shows the loading guard while the request is pending", () => {
      mockGet.mockReturnValue(deferred().promise);
      render(<EditWork />);
      expect(screen.getByTestId("loading")).toBeDefined();
      expect(screen.queryByTestId("work-edit")).toBeNull();
    });

    it("leaves the loading state once the request resolves", async () => {
      const d = deferred();
      mockGet.mockReturnValue(d.promise);
      render(<EditWork />);

      await act(async () => d.resolve());

      expect(screen.queryByTestId("loading")).toBeNull();
      expect(screen.getByTestId("work-edit")).toBeDefined();
    });

    it("shows not-found when there is no work", async () => {
      mockWork = null;
      render(<EditWork />);
      expect(await screen.findByTestId("not-found")).toBeDefined();
    });

    it("shows not-found when the request fails and there is no work", async () => {
      mockWork = null;
      mockGet.mockRejectedValue(apiError);
      render(<EditWork />);
      expect(await screen.findByTestId("not-found")).toBeDefined();
      expect(screen.queryByTestId("loading")).toBeNull();
    });

    it("shows the author guard when the user is not the author", async () => {
      mockWork = createWork(5, "bob");
      render(<EditWork />);
      expect(await screen.findByTestId("not-author")).toBeDefined();
      expect(screen.queryByTestId("work-edit")).toBeNull();
    });

    it("shows the author guard when logged out", async () => {
      mockUser = null;
      render(<EditWork />);
      expect(await screen.findByTestId("not-author")).toBeDefined();
    });
  });

  describe("props given to WorkEdit", () => {
    it("passes the work, categories and no errors", async () => {
      await renderLoaded();
      const props = latestProps();
      expect(props.work).toEqual(mockWork);
      expect(props.categories).toEqual(mockCategories);
      expect(props.errors).toBeNull();
    });

    it("passes the fetch error to the form when get fails but a work exists", async () => {
      mockGet.mockRejectedValue(apiError);
      await renderLoaded();
      expect(latestProps().errors).toEqual(apiError);
    });
  });

  describe("handleSave", () => {
    const data = { title: "New title", description: "New desc", image: null };

    it("updates the work with title and description and returns it", async () => {
      await renderLoaded();

      let result: Work | void = undefined;
      await act(async () => {
        result = await latestProps().handleSave(data);
      });

      expect(mockUpdate).toHaveBeenCalledWith(5, {
        title: "New title",
        description: "New desc",
      });
      expect(mockUploadImage).not.toHaveBeenCalled();
      expect((result as unknown as Work).title).toBe("Updated");
    });

    it("uploads the image after updating and returns the upload result", async () => {
      const image = new File(["x"], "work.png", { type: "image/png" });
      const uploaded = createWork(5, "alice", { imageUrl: "http://img/1.png" });
      mockUploadImage.mockResolvedValue(uploaded);
      await renderLoaded();

      let result: Work | void = undefined;
      await act(async () => {
        result = await latestProps().handleSave({ ...data, image });
      });

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUploadImage).toHaveBeenCalledWith(5, image);
      expect(mockUpdate.mock.invocationCallOrder[0]).toBeLessThan(
        mockUploadImage.mock.invocationCallOrder[0],
      );
      expect(result).toBe(uploaded);
    });

    it("stores the error and returns undefined when update fails", async () => {
      mockUpdate.mockRejectedValue(apiError);
      await renderLoaded();

      let result: Work | void = undefined;
      await act(async () => {
        result = await latestProps().handleSave(data);
      });

      expect(result).toBeUndefined();
      expect(latestProps().errors).toEqual(apiError);
      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it("stores the error when the image upload fails", async () => {
      mockUploadImage.mockRejectedValue(apiError);
      const image = new File(["x"], "work.png", { type: "image/png" });
      await renderLoaded();

      let result: Work | void = undefined;
      await act(async () => {
        result = await latestProps().handleSave({ ...data, image });
      });

      expect(result).toBeUndefined();
      expect(latestProps().errors).toEqual(apiError);
    });

    it("clears a previous error when saving again", async () => {
      mockUpdate.mockRejectedValueOnce(apiError);
      await renderLoaded();

      await act(async () => {
        await latestProps().handleSave(data);
      });
      expect(latestProps().errors).toEqual(apiError);

      await act(async () => {
        await latestProps().handleSave(data);
      });
      expect(latestProps().errors).toBeNull();
    });
  });

  describe("handlePublish", () => {
    it("submits the work with the category ids", async () => {
      await renderLoaded();

      await act(async () => {
        await latestProps().handlePublish?.([1, 2]);
      });

      expect(mockSubmit).toHaveBeenCalledWith(5, { categoryIds: [1, 2] });
      expect(latestProps().errors).toBeNull();
    });

    it("stores the error when submitting fails", async () => {
      mockSubmit.mockRejectedValue(apiError);
      await renderLoaded();

      await act(async () => {
        await latestProps().handlePublish?.([1]);
      });

      expect(latestProps().errors).toEqual(apiError);
    });
  });

  describe("handleRemove", () => {
    it("removes the work, then goes back to the works list", async () => {
      await renderLoaded();

      await act(async () => {
        await latestProps().handleRemove?.();
      });

      expect(mockRemove).toHaveBeenCalledWith(5);
      expect(mockPush).toHaveBeenCalledWith("/works");
      expect(mockRemove.mock.invocationCallOrder[0]).toBeLessThan(
        mockPush.mock.invocationCallOrder[0],
      );
    });

    it("stays on the page and stores the error when removal fails", async () => {
      mockRemove.mockRejectedValue(apiError);
      await renderLoaded();

      await act(async () => {
        await latestProps().handleRemove?.();
      });

      expect(mockPush).not.toHaveBeenCalled();
      expect(latestProps().errors).toEqual(apiError);
    });
  });

  describe("stale requests", () => {
    it("ignores a response for an id that is no longer current", async () => {
      const first = deferred();
      const second = deferred();
      mockGet.mockImplementation((id: number) =>
        id === 5 ? first.promise : second.promise,
      );

      const { rerender } = render(<EditWork />);
      mockParams = { id: "6" };
      rerender(<EditWork />);

      await act(async () => first.resolve());
      expect(screen.getByTestId("loading")).toBeDefined();

      await act(async () => second.resolve());
      expect(screen.queryByTestId("loading")).toBeNull();
    });

    it("ignores a failure for an id that is no longer current", async () => {
      const first = deferred();
      const second = deferred();
      mockGet.mockImplementation((id: number) =>
        id === 5 ? first.promise : second.promise,
      );

      const { rerender } = render(<EditWork />);
      mockParams = { id: "6" };
      rerender(<EditWork />);

      await act(async () => first.reject(apiError));
      expect(screen.getByTestId("loading")).toBeDefined();

      await act(async () => second.resolve());
      expect(screen.queryByTestId("loading")).toBeNull();
      expect(latestProps().errors).toBeNull();
    });
  });
});
