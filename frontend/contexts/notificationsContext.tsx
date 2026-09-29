"use client";

import { createContext, useContext } from "react";

const NotificationsContext = createContext(null);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationsContext.Provider value={null}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within a <NotificationsProvider>",
    );
  return ctx;
}
