/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "@jest/globals";
import EditCategories from "@/app/categories/edit/page";
import type { Category } from "@/types/api";
import { mockUser } from "../shared/mocks/auth";
import {
  cat,
  categoryActions,
  mockCategoriesState,
} from "../shared/mocks/categories";
import { lastConfirmDialogProps } from "../shared/mocks/ui";

jest.mock(
  "@/hooks/use-auth",
  () =>
    jest.requireActual<typeof import("../shared/mocks/auth")>(
      "../shared/mocks/auth",
    ).authModule,
);
jest.mock(
  "@/contexts/categoryContext",
  () =>
    jest.requireActual<typeof import("../shared/mocks/categories")>(
      "../shared/mocks/categories",
    ).categoryContextModule,
);
jest.mock(
  "@/components/header-portal",
  () =>
    jest.requireActual<typeof import("../shared/mocks/ui")>(
      "../shared/mocks/ui",
    ).headerPortalModule,
);
jest.mock(
  "@/components/confirmDialog",
  () =>
    jest.requireActual<typeof import("../shared/mocks/ui")>(
      "../shared/mocks/ui",
    ).confirmDialogModule,
);
jest.mock(
  "@/app/categories/_components/noCategory",
  () =>
    jest.requireActual<typeof import("../shared/mocks/ui")>(
      "../shared/mocks/ui",
    ).noCategoryModule,
);

// Local: only this page uses a Popover. Rendered inline to avoid portals.
jest.mock("@/components/ui/popover", () => ({
  Popover: ({
    open,
    children,
  }: {
    open: boolean;
    children?: React.ReactNode;
  }) => (
    <div data-testid="popover" data-open={String(open)}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ render }: { render: React.ReactNode }) => <>{render}</>,
  PopoverContent: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const { list, create, remove } = categoryActions;

function setup({
  admin = true,
  categories = [cat(1, "Peinture"), cat(2, "Sculpture")] as Category[],
} = {}) {
  mockUser("alice", { admin });
  mockCategoriesState(categories);
  return render(<EditCategories />);
}

describe("EditCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    list.mockResolvedValue(undefined);
    create.mockResolvedValue(undefined);
    remove.mockResolvedValue(undefined);
  });

  it("shows the empty state when there are no categories", () => {
    setup({ categories: [] });
    expect(screen.getByTestId("no-category")).toBeDefined();
  });

  it("shows add and delete controls to admins", () => {
    setup({ admin: true });
    expect(screen.getByTestId("popover")).toBeDefined();
    expect(screen.getByLabelText("Supprimer Peinture")).toBeDefined();
  });

  it("hides add and delete controls from non-admins", () => {
    setup({ admin: false });
    expect(screen.queryByTestId("popover")).toBeNull();
    expect(screen.queryByLabelText(/Supprimer/)).toBeNull();
    expect(screen.getByText("Peinture")).toBeDefined();
  });

  it("creates a category, then clears the field and closes the popover", async () => {
    setup();
    const input = screen.getByLabelText("Nom") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Photo" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => expect(create).toHaveBeenCalledWith({ name: "Photo" }));
    await waitFor(() => expect(input.value).toBe(""));
    expect(screen.getByTestId("popover").getAttribute("data-open")).toBe(
      "false",
    );
  });

  it("deletes the right category only after confirmation, then closes the dialog", async () => {
    setup();
    fireEvent.click(screen.getByLabelText("Supprimer Sculpture"));
    expect(lastConfirmDialogProps().open).toBe(true);
    expect(remove).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("confirm"));
    await waitFor(() => expect(remove).toHaveBeenCalledWith(2));
    await waitFor(() => expect(lastConfirmDialogProps().open).toBe(false));
  });
});
