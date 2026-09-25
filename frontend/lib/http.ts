import {
  API_BASE_URL,
  MOCK_SESSION_HEADER,
  MOCK_SESSION_STORAGE_KEY,
} from "./config";
import { ApiError } from "./errors";
import type { ApiErrorBody } from "@/types/api";

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown; // JSON | multipart/form-data.
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
}

function getMockSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(MOCK_SESSION_STORAGE_KEY);
}

function setMockSessionToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(MOCK_SESSION_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(MOCK_SESSION_STORAGE_KEY);
  }
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path.replace(/^\//, ""), `${API_BASE_URL}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * The single place where every repository funnels its HTTP calls through.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, headers: extraHeaders } = options;

  const headers: Record<string, string> = { ...extraHeaders };
  const mockToken = getMockSessionToken();
  if (mockToken) headers[MOCK_SESSION_HEADER] = mockToken;

  let finalBody: BodyInit | undefined;
  if (body instanceof FormData) {
    finalBody = body;
    // fetch sets the multipart boundary itself; do not set Content-Type.
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: finalBody,
    credentials: "include",
  });

  // The mocks hand back a fresh session token, the real backend does not send this header
  const returnedMockToken = response.headers.get(MOCK_SESSION_HEADER);
  if (returnedMockToken !== null) {
    setMockSessionToken(
      returnedMockToken.length > 0 ? returnedMockToken : null,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const errorBody: ApiErrorBody = data ?? {
      status: response.status,
      error: response.statusText || "Request failed",
    };
    throw new ApiError(errorBody);
  }

  return data as T;
}
