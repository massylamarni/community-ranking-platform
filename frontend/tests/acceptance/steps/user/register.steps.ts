import { LoginUserPayload, OwnProfile } from "@/types/api";
import {
  directLogin,
  directLogout,
  directRegister,
  login,
  logout,
  newAccount,
} from "../../utils/auth";
import { Given, Then, When } from "../fixtures";
import { expect } from "@playwright/test";
import { getProfile, waitForProfileUpdate } from "../../utils/profile";

Given("un visiteur est sur la page de création de compte", async ({ page }) => {
  await page.goto("/auth/register");
});

Given(
  "un compte existe avec le pseudo {string} et le mot de passe {string}",
  async ({ request }, username: string, password: string) => {
    await directRegister(request, {
      username,
      email: `${username}@example.com`,
      password,
    });
  },
);

Then("le compte {string} est créé", async ({ request, ctx }, value: string) => {
  await directLogin(request, {
    username: value,
    password: ctx.password,
  } as LoginUserPayload);
});

Then("le compte n'est pas créé", async ({ page }) => {
  await expect(page).toHaveURL(/\/auth\/register/);
  await expect(page.getByText("Compte créé avec succès")).toHaveCount(0);
});

Then("un message de confirmation est affiché", async ({ page }) => {
  await expect(page.getByText("Compte créé avec succès")).toBeVisible();
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
