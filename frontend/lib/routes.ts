export type Role = "visitor" | "user" | "admin";
export type Redirect = string | Partial<Record<Role, string>>;

export type Route = {
  path: string;
  allow: Role[];
  onDeny?: Redirect;
  onSuccess?: Redirect;
};

export const ALL: Role[] = ["visitor", "user", "admin"];
const HOME: Redirect = { user: "/works/mine", admin: "/moderation" };
export const DEFAULT_DENY = "/auth/login";

export const routes: Route[] = [
  { path: "/rankings", allow: ALL },
  { path: "/rankings/archives", allow: ALL },
  { path: "/categories", allow: ALL },
  { path: "/categories/[id]", allow: ALL },
  {
    path: "/categories/edit",
    allow: ["admin"],
    onDeny: { visitor: "/auth/login", user: "/categories" },
  },

  { path: "/works/[id]", allow: ALL },
  {
    path: "/works/[id]/edit",
    allow: ["user"],
    onDeny: { visitor: "/auth/login", admin: "/works/mine" },
    onSuccess: "/works/mine",
  },
  { path: "/works/mine", allow: ["user", "admin"], onDeny: "/auth/login" },
  {
    path: "/works/new",
    allow: ["user", "admin"],
    onDeny: "/auth/login",
    onSuccess: { user: "/works/:id/edit", admin: "/works/mine" },
  },

  { path: "/auth/login", allow: ["visitor"], onDeny: HOME, onSuccess: HOME },
  { path: "/auth/register", allow: ["visitor"], onDeny: HOME, onSuccess: HOME },
  {
    path: "/auth/forgotpassword",
    allow: ["visitor"],
    onDeny: "/auth/profile",
    onSuccess: "/auth/resetpassword",
  },
  {
    path: "/auth/resetpassword",
    allow: ["visitor"],
    onDeny: "/auth/profile",
    onSuccess: "/auth/login",
  },

  {
    path: "/auth/changepassword",
    allow: ["user", "admin"],
    onDeny: "/auth/login",
    onSuccess: "/auth/profile",
  },
  { path: "/auth/profile", allow: ["user", "admin"], onDeny: "/auth/login" },
  { path: "/profiles", allow: ["user", "admin"], onDeny: "/auth/login" },
  {
    path: "/moderation",
    allow: ["admin"],
    onDeny: { visitor: "/auth/login", user: "/works/mine" },
  },
];

export const pick = (
  r: Redirect | undefined,
  role: Role,
): string | undefined => (typeof r === "string" ? r : r?.[role]);

const toRegex = (p: string) =>
  new RegExp("^" + p.replace(/\[[^\]]+\]/g, "[^/]+") + "/?$");

const paramCount = (p: string) => p.match(/\[/g)?.length ?? 0;

const sorted = [...routes].sort(
  (a, b) => paramCount(a.path) - paramCount(b.path),
);

export const matchRoute = (pathname: string): Route | undefined =>
  sorted.find((r) => toRegex(r.path).test(pathname));

export const isOpenToAll = (route: Route): boolean =>
  ALL.every((r) => route.allow.includes(r));

/** Redirect URL if "role" may not access "route", otherwise null. */
export function decide(role: Role, route: Route): string | null {
  if (route.allow.includes(role)) return null;
  return pick(route.onDeny, role) ?? DEFAULT_DENY;
}

export function successUrl(
  path: string,
  role: Role,
  params: Record<string, string> = {},
): string {
  const target =
    pick(routes.find((r) => r.path === path)?.onSuccess, role) ?? "/";
  return target.replace(/:(\w+)/g, (_, k: string) => params[k] ?? "");
}

/** Accepts only same-origin absolute paths (prevents open redirects). */
export function safeRedirectPath(
  from: string | null | undefined,
): string | null {
  if (!from) return null;
  if (
    !from.startsWith("/") ||
    from.startsWith("//") ||
    from.startsWith("/\\")
  ) {
    return null;
  }
  return from;
}
