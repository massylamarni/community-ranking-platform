"use client";

import { MockingGate } from "./MockingGate";
import { AuthProvider } from "@/hooks/use-auth";
import { NotificationsProvider } from "@/contexts/notificationsContext";
import { CategoryProvider } from "@/contexts/categoryContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MockingGate>
      <AuthProvider>
        <NotificationsProvider>
          <CategoryProvider>{children}</CategoryProvider>
        </NotificationsProvider>
      </AuthProvider>
    </MockingGate>
  );
}
