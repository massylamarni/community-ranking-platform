import { NextRequest, NextResponse } from "next/server";
import { authRepository } from "./repositories";
import { MOCKING_ENABLED, SESSION_COOKIE_NAME } from "./lib/config";
import { CurrentUser } from "./types/api";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const LOGIN_PATH = "/login";
const FORBIDDEN_PATH = "/403";

type AccessLevel = "public" | "authenticated" | "admin";

interface RouteRule {
  matcher: RegExp;
  level: AccessLevel;
}

const ROUTE_RULES: RouteRule[] = [
  { matcher: /^\/moderation(\/.*)?$/, level: "admin" }, // moderation (ADM-004, MOD-004/005)
  { matcher: /^\/categories\/manage(\/.*)?$/, level: "admin" }, // catergories (CAT-001/002)
  { matcher: /^\/categories\/new$/, level: "admin" }, // categories (ADM-001)

  { matcher: /^\/profile(\/.*)?$/, level: "authenticated" }, // profile (AUTH-007)
  { matcher: /^\/account(\/.*)?$/, level: "authenticated" }, // password change (AUTH-005)
  { matcher: /^\/works\/new$/, level: "authenticated" }, // works (OEU-001..006)
  { matcher: /^\/works\/[^/]+\/edit$/, level: "authenticated" }, // PATCH /works/{id}
  { matcher: /^\/notifications(\/.*)?$/, level: "authenticated" }, // (NOTIF-*)

  { matcher: /^\/login$/, level: "public" },
  { matcher: /^\/register$/, level: "public" },
  { matcher: /^\/password\/forgot$/, level: "public" },
  { matcher: /^\/password\/reset$/, level: "public" },
  { matcher: /^\/categories$/, level: "public" }, // categories (CAT-003)
  { matcher: /^\/categories\/[^/]+\/works$/, level: "public" }, // (CAT-005)
  { matcher: /^\/works$/, level: "public" }, // browse
  { matcher: /^\/works\/[^/]+$/, level: "public" }, // works (OEU-015/016)
  { matcher: /^\/rankings(\/.*)?$/, level: "public" }, // CLAS-*
  { matcher: /^\/users\/[^/]+(\/.*)?$/, level: "public" }, // PROF-001/002/003/006
  { matcher: /^\/$/, level: "public" },
];

const DEFAULT_LEVEL: AccessLevel = "public";

function resolveAccessLevel(pathname: string): AccessLevel {
  for (const rule of ROUTE_RULES) {
    if (rule.matcher.test(pathname)) return rule.level;
  }
  return DEFAULT_LEVEL;
}

async function fetchCurrentUser(
  request: NextRequest,
): Promise<CurrentUser | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) return null;

  try {
    return await authRepository.me({
      cookie: `${SESSION_COOKIE_NAME}=${sessionCookie.value}`,
    });
  } catch {
    return null;
  }
}

function redirectToLogin(request: NextRequest): NextResponse {
  const url = new URL(LOGIN_PATH, request.url);
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function redirectToForbidden(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(FORBIDDEN_PATH, request.url));
}

/**
 * Stamps the resolved user onto request headers so Server Components,
 * layouts, and Route Handlers can do role-aware UI via:
 *
 *   import { headers } from "next/headers";
 *   const role = headers().get("x-user-role");
 *
 * Use the exported `getRequestUser()` helper below for a typed read.
 */
function withUserHeaders(
  request: NextRequest,
  user: CurrentUser | null,
): NextRequest {
  const headers = new Headers(request.headers);
  if (user) {
    headers.set("x-user-id", user.id);
    headers.set("x-user-username", user.username);
    headers.set("x-user-role", user.role);
  } else {
    headers.delete("x-user-id");
    headers.delete("x-user-username");
    headers.delete("x-user-role");
  }
  return new NextRequest(request, { headers });
}

export async function proxy(request: NextRequest) {
  if (MOCKING_ENABLED) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const level = resolveAccessLevel(pathname);

  if (level === "public") {
    const user = await fetchCurrentUser(request);
    return NextResponse.next({ request: withUserHeaders(request, user) });
  }

  const user = await fetchCurrentUser(request);

  if (!user) {
    return redirectToLogin(request);
  }

  if (level === "admin" && user.role !== "admin") {
    return redirectToForbidden(request);
  }

  return NextResponse.next({ request: withUserHeaders(request, user) });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};

export function getRequestUser(requestHeaders: Headers): CurrentUser | null {
  const id = requestHeaders.get("x-user-id");
  const username = requestHeaders.get("x-user-username");
  const role = requestHeaders.get("x-user-role");

  if (!id || !username || (role !== "user" && role !== "admin")) {
    return null;
  }

  return { id, username, role };
}

export function isAuthenticated(user: CurrentUser | null): boolean {
  return user !== null;
}

export function isAdmin(user: CurrentUser | null): boolean {
  return user?.role === "admin";
}

export function isOwner(
  user: CurrentUser | null,
  ownerId: string | undefined | null,
): boolean {
  return !!user && !!ownerId && user.id === ownerId;
}

export function canManage(
  user: CurrentUser | null,
  ownerId: string | undefined | null,
): boolean {
  return isAdmin(user) || isOwner(user, ownerId);
}
