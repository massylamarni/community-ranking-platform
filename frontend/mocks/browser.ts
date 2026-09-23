import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/**
 * Service Worker that intercepts every `fetch` the app makes (through
 * src/lib/http.ts) and answers with the fake backend in src/mocks/db.ts.
 */
export const worker = setupWorker(...handlers);
