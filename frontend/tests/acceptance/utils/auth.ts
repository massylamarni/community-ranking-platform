import { expect, Page, type APIRequestContext } from "@playwright/test";
import { apiURL, defaultPassword } from "./env";
import { clickAndWaitForApi } from "./network";
import { getSuffix } from ".";
import { LoginUserPayload, RegisterUserPayload } from "@/types/api";

export const ADMIN_ACCOUNT = {
  username: "admin",
  email: "admin@example.com",
  password: defaultPassword,
};

export function newAccount(): RegisterUserPayload {
  const suffix = getSuffix();
  return {
    username: `user_${suffix}`,
    email: `user_${suffix}@example.com`,
    password: defaultPassword,
  };
}

/* Normal flow */

export async function login(page: Page, account: LoginUserPayload) {
  await page.goto("/auth/login");
  await page.locator("#username").fill(account.username);
  await page.locator("#password").fill(account.password);
  const res = await clickAndWaitForApi(
    page,
    () => page.getByRole("button", { name: "Se connecter" }).click(),
    "/auth/login",
  );
  expect(res.status()).toBe(200);
}

export async function logout(page: Page) {
  await page.getByRole("navigation").getByRole("button").click();
  await page.getByRole("menuitem", { name: "Se déconnecter" }).click();
}

/* Direct inserts */

export async function directLogin(
  request: APIRequestContext,
  account: LoginUserPayload,
): Promise<void> {
  const response = await request.post(`${apiURL}/auth/login`, {
    data: { account: account.username, password: account.password },
  });
  expect(response.status()).toBe(200);
}

export async function directRegister(
  request: APIRequestContext,
  account: RegisterUserPayload,
) {
  const response = await request.post(`${apiURL}/auth/register`, {
    data: account,
  });
  // Already exists from a previous run.
  expect([201, 409]).toContain(response.status());
  return account;
}

export async function directLogout(request: APIRequestContext): Promise<void> {
  const response = await request.post(`${apiURL}/auth/logout`);
  expect([200]).toContain(response.status());
}
