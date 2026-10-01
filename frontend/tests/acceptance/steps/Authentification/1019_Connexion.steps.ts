import { createBdd } from "playwright-bdd";
import { regAccount } from "../../utils/accounts";
import { expect } from "@playwright/test";

const { Given, When, Then } = createBdd();

Given(
  "un compte existe avec le pseudo {string} et le mot de passe {string}",
  async ({ request }, username: string, password: string) => {
    await regAccount(request, {
      username,
      email: `${username}@example.com`,
      password,
    });
  },
);

Given("l'utilisateur est sur la page de connexion", async ({ page }) => {
  await page.goto("/auth/login");
});

When(
  "il saisit {string} comme identifiant",
  async ({ page }, value: string) => {
    await page.locator("#username").fill(value);
  },
);

When(
  "il saisit {string} comme mot de passe",
  async ({ page }, value: string) => {
    await page.locator("#password").fill(value);
  },
);

When("il valide le formulaire", async ({ page }) => {
  await page.getByRole("button", { name: "Se connecter" }).click();
});

Then("l'utilisateur est authentifié", async ({ page }) => {
  expect((await page.request.get("/backend-api/auth/me")).status()).toBe(200);
});

Then("il est redirigé vers son espace utilisateur", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Mes œuvres" })).toBeVisible();
});

When(
  "l'utilisateur saisit {string} comme identifiant",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then("l'utilisateur n'est pas authentifié", async ({ page }) => {
  expect((await page.request.get("/backend-api/auth/me")).status()).toBe(401);
});

Then(
  "un message indique que les identifiants sont incorrects",
  async ({ page }) => {
    await expect(page).toHaveURL(/\/auth\/login(?:\?.*)?$/);
    await expect(
      page.getByText("Identifiants invalides", { exact: true }),
    ).toBeVisible();
  },
);
