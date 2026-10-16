import { request } from "@/lib/http";
import type {
  AuthenticationUserResponse,
  ChangePasswordPayload,
  CurrentUser,
  ForgotPasswordPayload,
  LoginUserPayload,
  OwnProfile,
  RegisterUserPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from "@/types/api";

export const authRepository = {
  register(payload: RegisterUserPayload) {
    return request<AuthenticationUserResponse>("/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  login(payload: LoginUserPayload) {
    return request<AuthenticationUserResponse>("/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  logout() {
    return request<void>("/auth/logout", { method: "POST" });
  },

  async me(extraHeaders?: Record<string, string>): Promise<CurrentUser | null> {
    return request<CurrentUser | null>("/auth/me", { headers: extraHeaders });
  },

  changePassword(payload: ChangePasswordPayload) {
    return request<void>("/auth/password/change", {
      method: "POST",
      body: payload,
    });
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return request<void>("/auth/password/forgot", {
      method: "POST",
      body: payload,
    });
  },

  resetPassword(payload: ResetPasswordPayload) {
    return request<void>("/auth/password/reset", {
      method: "POST",
      body: payload,
    });
  },

  getOwnProfile() {
    return request<OwnProfile>("/profile");
  },

  updateOwnProfile(payload: UpdateProfilePayload) {
    return request<OwnProfile>("/profile", {
      method: "PATCH",
      body: payload,
    });
  },
};
