"use client";

import { useEffect, useState } from "react";
import { MOCKING_ENABLED } from "@/lib/config";

/*
let startPromise: Promise<void> | null = null;

function startMockWorker(): Promise<void> {
  if (!startPromise) {
    startPromise = import("@/mocks/browser").then(async ({ worker }) => {
      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: { url: "/mockServiceWorker.js" },
      });
    });
  }
  return startPromise;
}
  */

/**
 * Renders nothing until the mock Service Worker is ready, so no request
 * made by a page or a context races the worker's installation. When
 * mocking is disabled (NEXT_PUBLIC_API_MOCKING=disabled), this is a no-op
 * pass-through straight to the real backend.
 */
export function MockingGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!MOCKING_ENABLED);

  useEffect(() => {
    if (!MOCKING_ENABLED) return;
    /*
    let cancelled = false;
    startMockWorker().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
    */
  }, []);

  if (!ready) {
    return <p>Starting mock API…</p>;
  }

  return <>{children}</>;
}
