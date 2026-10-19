/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import { AuthProvider, isAdmin, isOwner, useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/errors";
import type { CurrentUser } from "@/types/api";
import type { authRepository } from "@/repositories";

type Repository = typeof authRepository;

const mockMe = jest.fn<ReturnType<Repository["me"]>, []>();
const mockLogout = jest.fn<ReturnType<Repository["logout"]>, []>();

jest.mock("@/repositories", () => ({
  authRepository: {
    me: () => mockMe(),
    logout: () => mockLogout(),
  },
}));

const user: CurrentUser = {
  id: 7,
  username: "alice",
  email: "alice@example.test",
  role: "user",
};

describe("auth helpers", () => {
  it("checks admin role and owner IDs consistently", () => {
    expect(isAdmin({ ...user, role: "admin" })).toBe(true);
    expect(isAdmin(user)).toBe(false);
    expect(isOwner(user, "7")).toBe(true);
    expect(isOwner(user, null)).toBe(false);
    expect(isOwner(null, 7)).toBe(false);
  });
});

describe("AuthProvider", () => {
  it("clears the authenticated user after logout", async () => {
    mockMe.mockResolvedValue(user);
    mockLogout.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => expect(result.current.user).toEqual(user));
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it("treats an unauthorized refresh as a signed-out user", async () => {
    mockMe.mockResolvedValue(user);
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    await waitFor(() => expect(result.current.user).toEqual(user));

    mockMe.mockRejectedValue(
      new ApiError({ status: 401, error: "Unauthorized" }),
    );
    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user).toBeNull();
  });
});
