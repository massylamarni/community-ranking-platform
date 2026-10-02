import { regAccount } from "../../utils/accounts";
import { defaultPassword } from "../../utils/env";
import { logIn, logOut } from "../../utils/ui";
import { Given, Then, When } from "../fixtures";
import { expect } from "@playwright/test";

Given(
  "l'utilisateur {string} est authentifié",
  async ({ page, request, ctx }, username: string) => {
    const account = {
      username,
      email: `${username}@example.com`,
      password: defaultPassword,
    };
    await regAccount(request, account);
    await logIn(page, account);
    ctx.account = account;
  },
);

When("il demande à se déconnecter", async ({ page }) => {
  await logOut(page);
});

Then("l'utilisateur n'est plus authentifié", async ({ page }) => {
  expect((await page.request.get("/backend-api/auth/me")).status()).toBe(401);
});

Then(
  "il est redirigé vers une page accessible aux visiteurs",
  async ({ page }) => {
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "Se connecter" }),
    ).toBeVisible();
  },
);

When("il se déconnecte", async ({}) => {
  // TODO: implement
});

When("il tente d'accéder à son espace utilisateur", async ({ page }) => {
  await page.goto("/works/mine");
});

Then("l'accès lui est refusé", async ({ page }) => {
  await expect(page).not.toHaveURL(/\/works\/mine$/);
  expect((await page.request.get("/backend-api/auth/me")).status()).toBe(401);
});

Then("il est invité à se connecter", async ({ page }) => {
  await expect(page).toHaveURL(/\/auth\/login\?from=/);
});
