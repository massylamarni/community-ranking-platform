export const mockUseAuth = jest.fn();
export const mockIsAdmin = jest.fn();

export const authModule = {
  useAuth: () => mockUseAuth(),
  isAdmin: (u: unknown) => mockIsAdmin(u),
};

// Pass null for logged out (undefined would trigger a default value)
export function mockUser(username: string | null, { admin = false } = {}) {
  mockUseAuth.mockReturnValue({ user: username ? { username } : null });
  mockIsAdmin.mockReturnValue(admin);
}

export function mockAuthState(
  user: { username: string } | null,
  userLoading = false,
) {
  mockUseAuth.mockReturnValue({ user, userLoading });
}
