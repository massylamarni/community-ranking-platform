import {
  routes,
  ALL,
  DEFAULT_DENY,
  pick,
  matchRoute,
  successUrl,
  safeRedirectPath,
  type Role,
  type Route,
} from "@/lib/routes";

const concrete = (p: string) =>
  p.replace(/:(\w+)/g, "1").replace(/\[[^\]]+\]/g, "1");
const pathOf = (url: string) => url.split("?")[0];

function allowedAt(url: string, role: Role): boolean {
  const route = matchRoute(concrete(pathOf(url)));
  return !!route && route.allow.includes(role);
}

describe("route table", () => {
  it("has no duplicate paths", () => {
    const paths = routes.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("every onDeny target exists and is allowed for the redirected role (no loops)", () => {
    const failures: string[] = [];
    for (const route of routes) {
      for (const role of ALL.filter((r) => !route.allow.includes(r))) {
        const target = pick(route.onDeny, role) ?? DEFAULT_DENY;
        if (!allowedAt(target, role)) {
          failures.push(`${route.path}: ${role} -> ${target}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("every onSuccess target exists and is allowed for the resulting role", () => {
    const rolesToCheck = (r: Route): Role[] =>
      typeof r.onSuccess === "string"
        ? r.allow
        : (Object.keys(r.onSuccess ?? {}) as Role[]);

    const failures: string[] = [];
    for (const route of routes.filter((r) => r.onSuccess)) {
      for (const role of rolesToCheck(route)) {
        const target = pick(route.onSuccess, role)!;
        if (!allowedAt(target, role)) {
          failures.push(`${route.path}: ${role} -> ${target}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("static routes win over dynamic ones", () => {
    expect(matchRoute("/works/mine")?.path).toBe("/works/mine");
    expect(matchRoute("/works/42")?.path).toBe("/works/[id]");
    expect(matchRoute("/categories/edit")?.path).toBe("/categories/edit");
    expect(matchRoute("/categories/7")?.path).toBe("/categories/[id]");
  });
});

describe("successUrl", () => {
  it("substitutes :id and picks by role", () => {
    expect(successUrl("/works/new", "user", { id: "9" })).toBe("/works/9/edit");
    expect(successUrl("/works/new", "admin", { id: "9" })).toBe("/works/mine");
    expect(successUrl("/auth/login", "admin")).toBe("/moderation");
  });
});

describe("safeRedirectPath", () => {
  it("accepts same-origin paths only", () => {
    expect(safeRedirectPath("/works/mine")).toBe("/works/mine");
    expect(safeRedirectPath("//evil.com")).toBeNull();
    expect(safeRedirectPath("https://evil.com")).toBeNull();
    expect(safeRedirectPath("/\\evil.com")).toBeNull();
    expect(safeRedirectPath(null)).toBeNull();
  });
});
