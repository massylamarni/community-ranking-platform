/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChangePassword from "@/app/auth/profile/_components/changePassword";
import { buildUseApi } from "@/tests/unit/shared/factories/useApi";

const mockChangePassword = jest.fn();
const mockUseAuth = jest.fn();
const mockApiValue = buildUseApi();

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));
jest.mock("@/hooks", () => ({
  useApi: () => mockApiValue,
}));

describe("ChangePassword", () => {
  beforeEach(() => {
    mockChangePassword.mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({ user: null, changePassword: mockChangePassword });
  });

  it("submits the entered old, new, and confirmation passwords", async () => {
    render(<ChangePassword />);

    await userEvent.type(screen.getByLabelText("Ancien mot de passe"), "old");
    await userEvent.type(screen.getByLabelText("Nouveau mot de passe"), "new");
    await userEvent.type(
      screen.getByLabelText("Confirmer le nouveau mot de passe"),
      "new",
    );
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() =>
      expect(mockChangePassword).toHaveBeenCalledWith({
        oldPassword: "old",
        newPassword: "new",
        confirmPassword: "new",
      }),
    );
  });
});
