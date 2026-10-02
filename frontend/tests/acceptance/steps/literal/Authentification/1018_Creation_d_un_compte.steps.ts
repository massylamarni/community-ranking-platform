import { expect } from "@playwright/test";
import { apiURL } from "../../utils/env";
import { Given, Then, When } from "../fixtures";
import { logIn } from "../../utils/ui";
import { TestAccount } from "../../utils/accounts";

Given("un visiteur est sur la page de création de compte", async ({ page }) => {
  await page.goto("/auth/register");
});

When("il saisit le pseudo {string}", async ({ page, ctx }, value: string) => {
  ctx.username = value;
  await page.locator("#username").fill(value);
});

When(
  "il saisit l'adresse e-mail {string}",
  async ({ page, ctx }, value: string) => {
    ctx.email = value;
    await page.locator("#email").fill(value);
  },
);

When(
  "il saisit le mot de passe {string}",
  async ({ page, ctx }, value: string) => {
    ctx.password = value;
    await page.locator("#password").fill(value);
  },
);

When("il valide le formulaire", async ({ page }) => {
  await page
    .getByRole("button", { name: /^(Se connecter|Créer le compte)$/ })
    .click();
});

Then(
  "le compte {string} est créé",
  async ({ request, ctx }, username: string) => {
    const response = await request.post(`${apiURL}/auth/register`, {
      data: { ...ctx, username },
    });
    expect(response.status()).toBe(409);
  },
);

Then("un message de confirmation est affiché", async ({ page }) => {
  await expect(page.getByText("Compte créé avec succès")).toBeVisible();
});

Then(
  "l'utilisateur peut se connecter avec ses identifiants",
  async ({ page, ctx }) => {
    await logIn(page, ctx as TestAccount); // TODO
  },
);

Then("le compte n'est pas créé", async ({ page }) => {
  await expect(page).toHaveURL(/\/auth\/register/);
  await expect(page.getByText("Compte créé avec succès")).toHaveCount(0);
});

Then("un message indique que le pseudo est obligatoire", async ({ page }) => {
  await expect(page.getByText(/pseudo.*obligatoire/i)).toBeVisible();
});

Then(
  "un message indique que l'adresse e-mail est invalide",
  async ({ page }) => {
    await expect(page.getByText(/e-?mail.*invalide/i)).toBeVisible();
  },
);
