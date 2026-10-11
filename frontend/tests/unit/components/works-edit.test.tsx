/** @jest-environment jsdom */

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it } from "@jest/globals";
import type { ComponentProps } from "react";
import type { Category, Work } from "@/types/api";
import { createWork, deferred } from "../utils";
import { WorkEdit } from "@/app/works/_components/workEdit";
import { mockUser } from "../mocks/auth";
import { cat, mockCategoriesState } from "../mocks/categories";
import { mockUploadFile } from "../mocks/ui";

// Polyfill for BaseUI click controls
if (typeof window !== "undefined" && !window.PointerEvent) {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    pointerType: string;

    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
      this.pointerType = init.pointerType ?? "mouse";
    }
  }
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}

jest.mock(
  "@/hooks/use-auth",
  () =>
    jest.requireActual<typeof import("../mocks/auth")>("../mocks/auth")
      .authModule,
);
jest.mock(
  "@/contexts/categoryContext",
  () =>
    jest.requireActual<typeof import("../mocks/categories")>(
      "../mocks/categories",
    ).categoryContextModule,
);
jest.mock(
  "@/app/categories/_components/noCategory",
  () =>
    jest.requireActual<typeof import("../mocks/ui")>("../mocks/ui")
      .noCategoryModule,
);
jest.mock(
  "@/components/attachmentUploader",
  () =>
    jest.requireActual<typeof import("../mocks/ui")>("../mocks/ui")
      .attachmentUploaderModule,
);
jest.mock(
  "@/components/confirmDialog",
  () =>
    jest.requireActual<typeof import("../mocks/ui")>("../mocks/ui")
      .confirmDialogModule,
);
jest.mock(
  "@/components/ui/scroll-area",
  () =>
    jest.requireActual<typeof import("../mocks/ui")>("../mocks/ui")
      .scrollAreaModule,
);

const categories = [cat(1, "Movie"), cat(2, "Music")];

function setup(
  overrides: Partial<ComponentProps<typeof WorkEdit>> = {},
  { admin = false, adminCategories = [] as Category[] } = {},
) {
  mockUser("alice", { admin });
  mockCategoriesState(adminCategories); // only read for admins

  const handleSave = jest.fn().mockResolvedValue(createWork(1));
  const handlePublish = jest.fn().mockResolvedValue(undefined);
  const handleRemove = jest.fn().mockResolvedValue(undefined);

  render(
    <WorkEdit
      work={createWork(1, "alice", {
        status: "created",
        categories: ["Movie"],
      })}
      categories={categories}
      errors={null}
      handleSave={handleSave}
      handlePublish={handlePublish}
      handleRemove={handleRemove}
      {...overrides}
    />,
  );
  return { handleSave, handlePublish, handleRemove };
}

const titleInput = () =>
  document.getElementById("work_title") as HTMLInputElement;
const descriptionInput = () =>
  document.getElementById("work_description") as HTMLInputElement;
const saveButton = () =>
  screen.getByRole("button", { name: /brouillon/i }) as HTMLButtonElement;
const publishButton = () =>
  screen.getByRole("button", { name: "Publier" }) as HTMLButtonElement;
const categoryBox = (name: string) => screen.getByRole("checkbox", { name });
const NO_CATEGORY = /Sélectionnez au moins une catégorie/;

describe("WorkEdit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create mode (no work, no handleRemove)", () => {
    const createProps = {
      work: null,
      handlePublish: undefined,
      handleRemove: undefined,
    };

    it("shows empty fields and the create label, without categories, publish or delete", () => {
      setup(createProps);
      expect(titleInput().value).toBe("");
      expect(saveButton().textContent).toBe("Créer le brouillon");
      expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
      expect(screen.queryByRole("button", { name: "Publier" })).toBeNull();
      expect(
        screen.queryByRole("button", { name: "Supprimer l'œuvre" }),
      ).toBeNull();
    });

    it("saves the typed values with no image", async () => {
      const { handleSave } = setup(createProps);
      fireEvent.change(titleInput(), { target: { value: "My title" } });
      fireEvent.change(descriptionInput(), { target: { value: "My desc" } });
      fireEvent.click(saveButton());

      await waitFor(() =>
        expect(handleSave).toHaveBeenCalledWith({
          title: "My title",
          description: "My desc",
          image: null,
        }),
      );
    });
  });

  describe("edit mode", () => {
    it("prefills the form from the work and shows the edit label", () => {
      setup();
      expect(titleInput().value).toBe("Component test work");
      expect(descriptionInput().value).toBe("A rendered work item");
      expect(saveButton().textContent).toBe("Enregistrer le brouillon");
    });

    it("passes the selected image to handleSave", async () => {
      const { handleSave } = setup();
      fireEvent.click(screen.getByTestId("uploader"));
      fireEvent.click(saveButton());

      await waitFor(() =>
        expect(handleSave).toHaveBeenCalledWith(
          expect.objectContaining({ image: mockUploadFile }),
        ),
      );
    });

    it("disables saving and hides publish when the work is not editable", () => {
      setup({ work: createWork(1, "alice", { status: "approved" }) });
      expect(saveButton().disabled).toBe(true);
      expect(screen.queryByRole("button", { name: "Publier" })).toBeNull();
    });

    it("disables both buttons while a save is in flight", async () => {
      const pending = deferred<Work>();
      const { handleSave } = setup();
      handleSave.mockReturnValue(pending.promise);

      fireEvent.click(saveButton());
      await waitFor(() => expect(saveButton().disabled).toBe(true));
      expect(publishButton().disabled).toBe(true);

      await act(async () => pending.resolve(createWork(1)));
      await waitFor(() => expect(saveButton().disabled).toBe(false));
    });

    it("renders field errors from the API", () => {
      setup({
        errors: {
          status: 422,
          error: "Validation failed",
          fields: {
            title: "Titre requis",
            description: "Description requise",
            categoryIds: "Catégorie invalide",
          },
        },
      });
      expect(screen.getByText("Titre requis")).toBeDefined();
      expect(screen.getByText("Description requise")).toBeDefined();
      expect(screen.getByText("Catégorie invalide")).toBeDefined();
    });
  });

  describe("categories", () => {
    it("lists the categories prop and pre-checks the work's categories", () => {
      setup();
      expect(categoryBox("Movie").getAttribute("aria-checked")).toBe("true");
      expect(categoryBox("Music").getAttribute("aria-checked")).toBe("false");
    });

    it("uses the context categories for admins instead of the prop", () => {
      setup({}, { admin: true, adminCategories: [cat(9, "Admin only")] });
      expect(categoryBox("Admin only")).toBeDefined();
      expect(screen.queryByRole("checkbox", { name: "Movie" })).toBeNull();
    });
  });

  describe("publishing", () => {
    it("saves, then publishes with the selected category ids", async () => {
      const { handleSave, handlePublish } = setup();
      fireEvent.click(categoryBox("Music"));
      fireEvent.click(publishButton());

      await waitFor(() => expect(handlePublish).toHaveBeenCalledWith([1, 2]));
      expect(handleSave).toHaveBeenCalledTimes(1);
      expect(handleSave.mock.invocationCallOrder[0]).toBeLessThan(
        handlePublish.mock.invocationCallOrder[0],
      );
    });

    it("refuses to publish without a category, and clears the error when one is toggled", async () => {
      const { handleSave, handlePublish } = setup();
      fireEvent.click(categoryBox("Movie")); // uncheck the only one
      fireEvent.click(publishButton());

      expect(await screen.findByText(NO_CATEGORY)).toBeDefined();
      expect(handleSave).not.toHaveBeenCalled();
      expect(handlePublish).not.toHaveBeenCalled();

      fireEvent.click(categoryBox("Music"));
      expect(screen.queryByText(NO_CATEGORY)).toBeNull();
    });

    it("does not publish when handleSave returns nothing", async () => {
      const { handleSave, handlePublish } = setup();
      handleSave.mockResolvedValue(undefined);
      fireEvent.click(publishButton());

      await waitFor(() => expect(handleSave).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(publishButton().disabled).toBe(false));
      expect(handlePublish).not.toHaveBeenCalled();
    });
  });

  describe("deleting", () => {
    const deleteButton = () =>
      screen.getByRole("button", { name: "Supprimer l'œuvre" });

    it("opens the confirm dialog and calls handleRemove on confirm", async () => {
      const { handleRemove } = setup();
      expect(screen.queryByTestId("confirm-dialog")).toBeNull();

      fireEvent.click(deleteButton());
      fireEvent.click(screen.getByText("confirm"));
      await waitFor(() => expect(handleRemove).toHaveBeenCalledTimes(1));
    });

    it("closes the dialog on cancel without removing", () => {
      const { handleRemove } = setup();
      fireEvent.click(deleteButton());
      fireEvent.click(screen.getByText("cancel"));

      expect(screen.queryByTestId("confirm-dialog")).toBeNull();
      expect(handleRemove).not.toHaveBeenCalled();
    });
  });
});
