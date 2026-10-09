/** @jest-environment jsdom */

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it } from "@jest/globals";
import type { ComponentProps, ReactNode } from "react";
import type { ApiErrorBody, Category, Work } from "@/types/api";
import { createWork } from "../utils";
import { WorkEdit } from "@/app/works/_components/workEdit";

let mockIsAdmin = false;
let mockAdminCategories: { id: number; name: string }[] = [];
const mockFile = new File(["x"], "work.png", { type: "image/png" });

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: { username: "alice" } }),
  isAdmin: () => mockIsAdmin,
}));

jest.mock("@/contexts/categoryContext", () => ({
  useCategory: () => ({ categories: mockAdminCategories }),
}));

jest.mock("@/app/categories/_components/noCategory", () => ({
  __esModule: true,
  default: () => <div data-testid="no-category" />,
}));

jest.mock("@/components/attachmentUploader", () => ({
  AttachmentUploader: ({
    onFileSelect,
  }: {
    onFileSelect: (f: File | null) => void;
  }) => (
    <button
      type="button"
      data-testid="uploader"
      onClick={() => onFileSelect(mockFile)}
    >
      upload
    </button>
  ),
}));

jest.mock("@/components/confirmDialog", () => ({
  ConfirmDialog: ({
    open,
    onOpenChange,
    onConfirm,
  }: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onConfirm?: () => void;
  }) =>
    open ? (
      <div data-testid="confirm-dialog">
        <button type="button" onClick={onConfirm}>
          confirm
        </button>
        <button type="button" onClick={() => onOpenChange(false)}>
          cancel
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

if (!window.PointerEvent) {
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

const categories = [
  { id: 1, name: "Movie" },
  { id: 2, name: "Music" },
] as Category[];

function setup(overrides: Partial<ComponentProps<typeof WorkEdit>> = {}) {
  const handleSave = jest.fn().mockResolvedValue(createWork(1));
  const handlePublish = jest.fn().mockResolvedValue(undefined);
  const handleRemove = jest.fn().mockResolvedValue(undefined);

  const props: ComponentProps<typeof WorkEdit> = {
    work: createWork(1, "alice", { status: "created", categories: ["Movie"] }),
    categories,
    errors: null,
    handleSave,
    handlePublish,
    handleRemove,
    ...overrides,
  };
  render(<WorkEdit {...props} />);
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

describe("WorkEdit", () => {
  beforeEach(() => {
    mockIsAdmin = false;
    mockAdminCategories = [];
  });

  describe("create mode (no work, no handleRemove)", () => {
    const createProps = {
      work: null,
      handlePublish: undefined,
      handleRemove: undefined,
    };

    it("shows empty fields and the create label", () => {
      setup(createProps);
      expect(titleInput().value).toBe("");
      expect(descriptionInput().value).toBe("");
      expect(saveButton().textContent).toBe("Créer le brouillon");
    });

    it("hides category selection, publish and delete sections", () => {
      setup(createProps);
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
          expect.objectContaining({ image: mockFile }),
        ),
      );
    });

    it("disables saving and hides publish when the work is not editable", () => {
      setup({ work: createWork(1, "alice", { status: "approved" }) });
      expect(saveButton().disabled).toBe(true);
      expect(screen.queryByRole("button", { name: "Publier" })).toBeNull();
    });

    it("disables both buttons while a save is in flight", async () => {
      let resolveSave!: (w: Work) => void;
      const { handleSave } = setup();
      handleSave.mockReturnValue(
        new Promise<Work>((r) => {
          resolveSave = r;
        }),
      );

      fireEvent.click(saveButton());
      await waitFor(() => expect(saveButton().disabled).toBe(true));
      expect(publishButton().disabled).toBe(true);

      await act(async () => {
        resolveSave(createWork(1));
      });
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

    it("toggles a category on click", () => {
      setup();
      fireEvent.click(categoryBox("Music"));
      expect(categoryBox("Music").getAttribute("aria-checked")).toBe("true");
      fireEvent.click(categoryBox("Music"));
      expect(categoryBox("Music").getAttribute("aria-checked")).toBe("false");
    });

    it("shows the empty state when there are no categories", () => {
      setup({ categories: [] });
      expect(screen.getByTestId("no-category")).toBeDefined();
    });

    it("uses the context categories for admins instead of the prop", () => {
      mockIsAdmin = true;
      mockAdminCategories = [{ id: 9, name: "Admin only" }];
      setup();

      expect(categoryBox("Admin only")).toBeDefined();
      expect(screen.queryByRole("checkbox", { name: "Movie" })).toBeNull();
    });
  });

  describe("publishing", () => {
    it("shows the publish button for created and rejected works", () => {
      setup({ work: createWork(1, "alice", { status: "rejected" }) });
      expect(publishButton()).toBeDefined();
    });

    it("hides the publish button without a handlePublish", () => {
      setup({ handlePublish: undefined });
      expect(screen.queryByRole("button", { name: "Publier" })).toBeNull();
    });

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

    it("refuses to publish without a category and shows an error", async () => {
      const { handleSave, handlePublish } = setup();
      fireEvent.click(categoryBox("Movie")); // uncheck the only one
      fireEvent.click(publishButton());

      expect(
        await screen.findByText(/Sélectionnez au moins une catégorie/),
      ).toBeDefined();
      expect(handleSave).not.toHaveBeenCalled();
      expect(handlePublish).not.toHaveBeenCalled();
    });

    it("clears the category error when a category is toggled", async () => {
      setup();
      fireEvent.click(categoryBox("Movie"));
      fireEvent.click(publishButton());
      await screen.findByText(/Sélectionnez au moins une catégorie/);

      fireEvent.click(categoryBox("Music"));
      expect(
        screen.queryByText(/Sélectionnez au moins une catégorie/),
      ).toBeNull();
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
      expect(screen.getByTestId("confirm-dialog")).toBeDefined();

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
