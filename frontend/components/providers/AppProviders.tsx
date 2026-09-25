"use client";

import { MockingGate } from "./MockingGate";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MockingGate>
      <AuthProvider>
        <NotificationsProvider>{children}</NotificationsProvider>
      </AuthProvider>
    </MockingGate>
  );
}
