export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const MOCKING_ENABLED =
  process.env.NEXT_PUBLIC_API_MOCKING !== "disabled";

/**
 * localStorage key used to remember which mock session is "logged in" across page reloads.
 * This is purely a stand-in so the mocks behave statefully in a browser
 * Service Worker, which cannot reliably set cookies on synthetic responses.
 */
export const MOCK_SESSION_STORAGE_KEY = "works-platform.mock-session-token";

/** Custom header the mocks use to move the token around. */
export const MOCK_SESSION_HEADER = "x-mock-session-token";
