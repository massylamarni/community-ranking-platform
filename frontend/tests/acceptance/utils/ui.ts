import { expect, type Page } from "@playwright/test";
import type { TestAccount } from "./accounts";
import { clickAndWaitForApi } from "./network";

export async function logIn(page: Page, account: TestAccount) {
  await page.goto("/auth/login");
  await page.locator("#username").fill(account.username);
  await page.locator("#password").fill(account.password);
  const res = await clickAndWaitForApi(
    page,
    () => page.getByRole("button", { name: "Se connecter" }).click(),
    "/auth/login",
  );
  expect(res.status()).toBe(200);
  await expect(page).toHaveURL(/\/works\/mine$/);
}

export async function createDraft(
  page: Page,
  title: string,
  description: string,
) {
  await page.goto("/works/new");
  await page.locator("#work_title").fill(title);
  await page.locator("#work_description").fill(description);
  const res = await clickAndWaitForApi(
    page,
    () => page.getByRole("button", { name: "Créer le brouillon" }).click(),
    "/works",
  );
  expect(res.status()).toBe(201);
  await expect(page).toHaveURL(/\/works\/\d+\/edit$/);
}

export async function logOut(page: Page) {
  await page.getByRole("navigation").getByRole("button").click();
  await page.getByRole("menuitem", { name: "Se déconnecter" }).click();
}
