/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkEdit } from "@/app/works/_components/workEdit";
import { buildUseApi } from "@/tests/unit/shared/factories/useApi";
import { buildWork } from "@/tests/unit/shared/factories/work";

const mockUseAuth = jest.fn();
const mockIsAdmin = jest.fn();
const mockUseCategory = jest.fn();
const mockUseWorks = jest.fn();
const mockPush = jest.fn();
const mockRun = jest.fn();

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
  isAdmin: (...args: unknown[]) => mockIsAdmin(...args),
}));
jest.mock("@/hooks", () => ({
  useApi: () => mockApiValue,
  useWorks: () => mockUseWorks(),
}));
jest.mock("@/contexts/categoryContext", () => ({
  useCategory: () => mockUseCategory(),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock("@/components/attachmentUploader", () => ({
  AttachmentUploader: () => null,
}));
jest.mock("@/components/confirmDialog", () => ({
  ConfirmDialog: () => null,
}));

const mockApiValue = buildUseApi({ run: mockRun });
const category = { id: 6, name: "Photographie" };

describe("WorkEdit publishing", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 2, username: "alice", email: "alice@example.com", role: "user" },
    });
    mockIsAdmin.mockReturnValue(false);
    mockUseCategory.mockReturnValue({ categories: [category] });
    mockUseWorks.mockReturnValue({
      create: jest.fn(),
      submit: jest.fn().mockResolvedValue(undefined),
      update: jest.fn(),
      uploadImage: jest.fn(),
      remove: jest.fn(),
    });
    mockRun.mockResolvedValue({ ok: true, data: undefined });
  });

  it("requires a category before publishing an existing work", async () => {
    const hooks = mockUseWorks();
    render(
      <WorkEdit
        type="edit"
        work={buildWork({ id: 18, status: "created" })}
        categories={[category]}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Publier" }));

    expect(
      screen.getByText("Sélectionnez au moins une catégorie pour publier l'œuvre."),
    ).not.toBeNull();
    expect(hooks.submit).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("submits the selected category and routes to the user's works on success", async () => {
    const hooks = mockUseWorks();
    render(
      <WorkEdit
        type="edit"
        work={buildWork({
          id: 18,
          status: "created",
          categories: ["Photographie"],
        })}
        categories={[category]}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Publier" }));

    expect(hooks.submit).toHaveBeenCalledWith(18, {
      title: "Test work",
      description: "A test description",
      categoryIds: [6],
    });
    expect(mockPush).toHaveBeenCalledWith("/works/mine");
  });
});
