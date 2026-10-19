/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationList } from "@/app/notifications/_components/notificationList";
import type { Notification } from "@/types/api";

const notifications: Notification[] = [
  {
    id: 1,
    type: "SYSTEM",
    message: "Older read notice",
    read: true,
    createdAt: "2026-10-18T10:00:00Z",
  },
  {
    id: 2,
    type: "MODERATION",
    message: "Newest unread notice",
    read: false,
    createdAt: "2026-10-19T10:00:00Z",
  },
];

describe("NotificationList", () => {
  it("sorts newest first and marks an unread notification as read when selected", async () => {
    const onRead = jest.fn();
    render(
      <NotificationList
        notifications={notifications}
        loading={false}
        error={null}
        onRead={onRead}
      />,
    );

    const messages = screen.getAllByText(/notice/);
    expect(messages[0].textContent).toBe("Newest unread notice");
    expect(messages[1].textContent).toBe("Older read notice");
    expect(screen.getByText("Non lue")).not.toBeNull();

    await userEvent.click(screen.getByText("Newest unread notice"));
    expect(onRead).toHaveBeenCalledWith(2);
  });
});
