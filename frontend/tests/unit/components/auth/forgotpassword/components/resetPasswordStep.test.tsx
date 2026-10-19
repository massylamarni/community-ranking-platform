/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordStep } from "@/app/auth/forgotpassword/_components/resetPasswordStep";
import { mockUseAuth } from "@/tests/unit/shared/mocks/hooks/use-auth";
import { mockUseApi } from "@/tests/unit/shared/mocks/hooks/use-api";
import { buildUseApi } from "@/tests/unit/shared/factories/useApi";

jest.mock("@/hooks/use-auth", () => ({ useAuth: () => mockUseAuth() }));
jest.mock("@/hooks/use-api", () => ({ useApi: () => mockUseApi() }));
jest.mock("@/app/auth/_components/newPasswordFields", () => ({
  NewPasswordFields: () => null,
}));

const mockResetPassword = jest.fn().mockResolvedValue(undefined);
const mockRun = jest.fn();

beforeEach(() => {
  mockUseAuth.mockReturnValue({
    user: null,
    resetPassword: mockResetPassword,
  });
  mockRun.mockResolvedValue({ ok: true, data: undefined });
  mockUseApi.mockReturnValue(buildUseApi({ run: mockRun }));
});

async function submitWithToken(token = "abc123") {
  await userEvent.type(
    screen.getByLabelText("Code de réinitialisation"),
    token,
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Réinitialiser le mot de passe" }),
  );
}

describe("ResetPasswordStep: onComplete", () => {
  it.each([
    { ok: true, expectedCalls: 1 },
    { ok: false, expectedCalls: 0 },
  ])(
    "calls onComplete $expectedCalls time(s) when run resolves with ok=$ok",
    async ({ ok, expectedCalls }) => {
      mockRun.mockResolvedValue(
        ok ? { ok: true, data: undefined } : { ok: false },
      );
      const onComplete = jest.fn();
      render(<ResetPasswordStep onComplete={onComplete} />);

      await submitWithToken();

      await waitFor(() => expect(mockRun).toHaveBeenCalledTimes(1));
      await mockRun.mock.results[0].value;
      expect(onComplete).toHaveBeenCalledTimes(expectedCalls);
    },
  );
});

describe("ResetPasswordStep: submit button", () => {
  it.each([
    { loading: true, disabled: true },
    { loading: false, disabled: false },
  ])("is disabled=$disabled when loading=$loading", ({ loading, disabled }) => {
    mockUseApi.mockReturnValue(buildUseApi({ run: mockRun, loading }));
    render(<ResetPasswordStep onComplete={jest.fn()} />);

    const button = screen.getByRole("button", {
      name: "Réinitialiser le mot de passe",
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(disabled);
  });
});
