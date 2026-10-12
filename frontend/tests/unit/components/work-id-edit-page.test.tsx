/** @jest-environment jsdom */

import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "@jest/globals";
import EditWork from "@/app/works/[id]/edit/page";
import { createWork } from "../shared/utils";
import { mockPush, mockRouteParams } from "../shared/mocks/navigation";
import { workActions, mockWorksState } from "../shared/mocks/works";
import {
  cat,
  categoryActions,
  mockCategoriesState,
} from "../shared/mocks/categories";
import { mockAuthorWorkGuard, setGuardResult } from "../shared/mocks/guards";
import { lastWorkEditProps } from "../shared/mocks/views";

jest.mock(
  "next/navigation",
  () =>
    jest.requireActual<typeof import("../shared/mocks/navigation")>(
      "../shared/mocks/navigation",
    ).navigationModule,
);
jest.mock(
  "@/hooks/use-work",
  () =>
    jest.requireActual<typeof import("../shared/mocks/works")>(
      "../shared/mocks/works",
    ).useWorksModule,
);
jest.mock(
  "@/contexts/categoryContext",
  () =>
    jest.requireActual<typeof import("../shared/mocks/categories")>(
      "../shared/mocks/categories",
    ).categoryContextModule,
);
jest.mock(
  "@/app/works/_components/guards/authorWorkGuard",
  () =>
    jest.requireActual<typeof import("../shared/mocks/guards")>(
      "../shared/mocks/guards",
    ).authorWorkGuardModule,
);
jest.mock(
  "@/app/works/_components/workEdit",
  () =>
    jest.requireActual<typeof import("../shared/mocks/views")>(
      "../shared/mocks/views",
    ).workEditModule,
);

const { submit, update, uploadImage, remove } = workActions;
const { list } = categoryActions;

const categories = [cat(1, "Peinture")];
const data = { title: "New", description: "Desc", image: null };

function setup({ id = "1", fetchError = null as unknown } = {}) {
  mockRouteParams({ id });
  mockWorksState(null); // the page itself only uses the actions
  mockCategoriesState(categories);
  setGuardResult(createWork(1, "alice"), fetchError);
  return render(<EditWork />);
}

// Runs a WorkEdit handler inside act and returns its result
async function run<T>(fn: () => Promise<T>) {
  let result!: T;
  await act(async () => {
    result = await fn();
  });
  return result;
}

describe("EditWork (route page)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    list.mockResolvedValue(undefined);
    submit.mockResolvedValue(undefined);
    update.mockResolvedValue(undefined);
    uploadImage.mockResolvedValue(undefined);
    remove.mockResolvedValue(undefined);
  });

  it("gives the guard the numeric id, loads categories and renders WorkEdit", () => {
    setup({ id: "42" });
    expect(mockAuthorWorkGuard).toHaveBeenCalledWith(42);
    expect(list).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("work-edit")).toBeDefined();
    expect(lastWorkEditProps().categories).toEqual(categories);
  });

  describe("handleSave", () => {
    it("updates the title and description and returns the updated work", async () => {
      const updated = createWork(1, "alice", { title: "New" });
      update.mockResolvedValue(updated);
      setup();

      const result = await run(() => lastWorkEditProps().handleSave(data));

      expect(update).toHaveBeenCalledWith(1, {
        title: "New",
        description: "Desc",
      });
      expect(uploadImage).not.toHaveBeenCalled();
      expect(result).toBe(updated);
    });

    it("uploads the image after the update and returns the upload result", async () => {
      const withImage = createWork(1, "alice", { title: "New" });
      uploadImage.mockResolvedValue(withImage);
      const image = new File(["x"], "a.png", { type: "image/png" });
      setup();

      const result = await run(() =>
        lastWorkEditProps().handleSave({ ...data, image }),
      );

      expect(update).toHaveBeenCalledTimes(1);
      expect(uploadImage).toHaveBeenCalledWith(1, image);
      expect(result).toBe(withImage);
    });

    it.each<[string, () => void, unknown]>([
      [
        "update fails",
        () => {
          update.mockRejectedValue({ message: "invalid" });
        },
        { message: "invalid" },
      ],
      [
        "the upload fails",
        () => {
          uploadImage.mockRejectedValue({ message: "too big" });
        },
        { message: "too big" },
      ],
    ])(
      "sets the errors and returns undefined when %s",
      async (_label, arrange, expectedError) => {
        arrange();
        setup();

        const result = await run(() =>
          lastWorkEditProps().handleSave({
            ...data,
            image: new File(["x"], "a.png"),
          }),
        );

        expect(result).toBeUndefined();
        expect(lastWorkEditProps().errors).toEqual(expectedError);
      },
    );

    it("starts with the fetch error, which the next save replaces and then clears", async () => {
      update
        .mockRejectedValueOnce({ message: "boom" })
        .mockResolvedValueOnce(undefined);
      setup({ fetchError: { message: "from fetch" } });
      expect(lastWorkEditProps().errors).toEqual({ message: "from fetch" });

      await run(() => lastWorkEditProps().handleSave(data));
      expect(lastWorkEditProps().errors).toEqual({ message: "boom" });

      await run(() => lastWorkEditProps().handleSave(data));
      expect(lastWorkEditProps().errors).toBeNull();
    });
  });

  describe("handlePublish", () => {
    it("submits the work with the chosen category ids", async () => {
      setup();
      await run(() => lastWorkEditProps().handlePublish([1, 3]));
      expect(submit).toHaveBeenCalledWith(1, { categoryIds: [1, 3] });
    });

    it("sets the errors when submit fails, then clears them on the next attempt", async () => {
      const err = { message: "no category" };
      submit.mockRejectedValueOnce(err).mockResolvedValueOnce(undefined);
      setup();

      await run(() => lastWorkEditProps().handlePublish([]));
      expect(lastWorkEditProps().errors).toBe(err);

      await run(() => lastWorkEditProps().handlePublish([1]));
      expect(lastWorkEditProps().errors).toBeNull();
    });
  });

  describe("handleRemove", () => {
    it("removes the work then redirects to /works", async () => {
      setup();
      await run(() => lastWorkEditProps().handleRemove());
      expect(remove).toHaveBeenCalledWith(1);
      expect(mockPush).toHaveBeenCalledWith("/works");
    });

    it("does not redirect and sets the errors when remove fails", async () => {
      const err = { message: "forbidden" };
      remove.mockRejectedValue(err);
      setup();

      await run(() => lastWorkEditProps().handleRemove());
      expect(mockPush).not.toHaveBeenCalled();
      expect(lastWorkEditProps().errors).toBe(err);
    });
  });
});
