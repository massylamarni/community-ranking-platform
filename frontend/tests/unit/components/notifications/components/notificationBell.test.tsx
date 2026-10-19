/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationBell } from "@/app/notifications/_components/notificationBell";

const mockUseAuth = jest.fn();
const mockRefresh = jest.fn();
const mockMarkAllAsRead = jest.fn();
const mockClearActionError = jest.fn();
const mockNotificationsState = {
  notifications: [],
  unreadCount: 12,
  loading: false,
  error: null,
  actionError: null,
  refresh: mockRefresh,
  markAsRead: jest.fn(),
  markAllAsRead: mockMarkAllAsRead,
  clearActionError: mockClearActionError,
};

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));
jest.mock("@/contexts/notificationsContext", () => ({
  useNotifications: () => mockNotificationsState,
}));

describe("NotificationBell", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 3, username: "bob", email: "bob@example.com", role: "user" },
    });
  });

  it("hides for logged-out users and refreshes when opened", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { rerender } = render(<NotificationBell />);
    expect(screen.queryByRole("button")).toBeNull();

    mockUseAuth.mockReturnValue({
      user: { id: 3, username: "bob", email: "bob@example.com", role: "user" },
    });
    rerender(<NotificationBell />);
    expect(screen.getByText("9+")).not.toBeNull();

    await userEvent.click(
      screen.getByRole("button", {
        name: "Notifications (12 non lues)",
      }),
    );
    expect(mockClearActionError).toHaveBeenCalledTimes(1);
    expect(mockRefresh).toHaveBeenCalledTimes(1);

    await userEvent.click(
      screen.getByRole("button", { name: "Tout marquer comme lu" }),
    );
    expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
  });
});
