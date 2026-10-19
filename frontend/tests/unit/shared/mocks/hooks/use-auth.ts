import type { CurrentUser } from "@/types/api";

export const mockUseAuth = jest.fn(() => ({
  user: {
    id: 2,
    username: "alice",
    email: "alice@e.c",
    role: "user",
  } as CurrentUser | null,
}));
