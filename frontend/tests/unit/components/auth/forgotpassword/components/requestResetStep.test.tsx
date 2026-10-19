/**
 * @jest-environment jsdom
 */
import { RequestResetStep } from "@/app/auth/forgotpassword/_components/requestResetStep";
import { buildUseApi } from "@/tests/unit/shared/factories/useApi";
import { mockUseApi } from "@/tests/unit/shared/mocks/hooks/use-api";
import { mockUseAuth } from "@/tests/unit/shared/mocks/hooks/use-auth";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/hooks/use-auth", () => ({ useAuth: () => mockUseAuth() }));
jest.mock("@/hooks", () => ({ useApi: () => mockUseApi() }));

const mockForgotPassword = jest.fn().mockResolvedValue(undefined);
const mockRun = jest.fn();

beforeEach(() => {
  mockUseAuth.mockReturnValue({
    user: null,
    forgotPassword: mockForgotPassword,
  });
  mockRun.mockResolvedValue({ ok: true, data: undefined });
  mockUseApi.mockReturnValue(buildUseApi({ run: mockRun }));
});

async function submitWithEmail(email = "alice@example.com") {
  await userEvent.type(screen.getByLabelText("Email"), email);
  await userEvent.click(
    screen.getByRole("button", { name: "Envoyer le code" }),
  );
}

describe("RequestResetStep: onSent", () => {
  it.each([
    { ok: true, expectedCalls: 1 },
    { ok: false, expectedCalls: 0 },
  ])(
    "calls onSent $expectedCalls time(s) when run resolves with ok=$ok",
    async ({ ok, expectedCalls }) => {
      mockRun.mockResolvedValue(
        ok ? { ok: true, data: undefined } : { ok: false },
      );
      const onSent = jest.fn();
      render(<RequestResetStep onSent={onSent} />);

      await submitWithEmail();

      await waitFor(() => expect(mockRun).toHaveBeenCalledTimes(1));
      await mockRun.mock.results[0].value;
      expect(onSent).toHaveBeenCalledTimes(expectedCalls);
    },
  );
});

describe("RequestResetStep: submit button", () => {
  it.each([
    { loading: true, disabled: true },
    { loading: false, disabled: false },
  ])("is disabled=$disabled when loading=$loading", ({ loading, disabled }) => {
    mockUseApi.mockReturnValue(buildUseApi({ run: mockRun, loading }));
    render(<RequestResetStep onSent={jest.fn()} />);

    const button = screen.getByRole("button", {
      name: "Envoyer le code",
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(disabled);
  });
});
