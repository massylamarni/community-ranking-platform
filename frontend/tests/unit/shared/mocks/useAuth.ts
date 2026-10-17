import type { CurrentUser } from "@/types/api";

export const mockUseAuth = jest.fn(() => ({
  user: null as CurrentUser | null,
}));
