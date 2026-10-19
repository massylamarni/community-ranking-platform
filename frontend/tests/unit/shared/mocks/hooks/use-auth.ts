import type {
  CurrentUser,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "@/types/api";

type MockAuth = {
  user: CurrentUser | null;
  forgotPassword?: (payload: ForgotPasswordPayload) => Promise<void>;
  resetPassword?: (payload: ResetPasswordPayload) => Promise<void>;
};

export const mockUseAuth = jest.fn(
  (): MockAuth => ({
    user: {
      id: 2,
      username: "alice",
      email: "alice@e.c",
      role: "user",
    },
  }),
);
