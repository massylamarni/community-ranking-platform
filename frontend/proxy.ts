import { NextRequest, NextResponse } from "next/server";
import { authRepository } from "./repositories";
import { MOCKING_ENABLED, SESSION_COOKIE_NAME } from "./lib/config";
import { matchRoute, isOpenToAll, decide, type Role } from "./lib/routes";
import type { CurrentUser } from "./types/api";

async function fetchCurrentUser(req: NextRequest): Promise<CurrentUser | null> {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie) return null;
  try {
    return await authRepository.me({
      cookie: `${SESSION_COOKIE_NAME}=${cookie.value}`,
    });
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  if (MOCKING_ENABLED) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const route = matchRoute(pathname);

  if (!route || isOpenToAll(route)) return NextResponse.next();

  const user = await fetchCurrentUser(req);
  const role: Role = user?.role ?? "visitor";

  const redirect = decide(role, route);
  if (!redirect) return NextResponse.next();

  const url = new URL(redirect, req.url);
  if (role === "visitor") url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
