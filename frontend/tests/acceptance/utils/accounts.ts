import { randomUUID } from "node:crypto";
import { expect, type APIRequestContext } from "@playwright/test";
import { apiURL, defaultPassword } from "./env";

export type TestAccount = { username: string; email: string; password: string };

export function newAccount(): TestAccount {
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  return {
    username: `pw_${suffix}`,
    email: `pw_${suffix}@example.com`,
    password: defaultPassword,
  };
}

export async function createAccount(request: APIRequestContext) {
  return regAccount(request, newAccount());
}

export async function regAccount(
  request: APIRequestContext,
  account: TestAccount,
) {
  const response = await request.post(`${apiURL}/auth/register`, {
    data: account,
  });
  // Already exists from a previous run.
  expect([201, 409]).toContain(response.status());
  return account;
}
