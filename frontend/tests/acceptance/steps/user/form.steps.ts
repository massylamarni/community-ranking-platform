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

When(
  "il saisit {string} comme identifiant",
  async ({ page, ctx }, value: string) => {
    ctx.username = value;
    await page.locator("#username").fill(value);
  },
);

When("il saisit le pseudo {string}", async ({ page, ctx }, value: string) => {
  ctx.username = value;
  await page.locator("#username").fill(value);
});

When(
  "il saisit l'adresse e-mail {string}",
  async ({ page, ctx }, value: string) => {
    ctx.email = value;
    await page.locator("#email").fill(String(ctx.email));
  },
);

When("il saisit {string}", async ({ page }, value: string) => {
  await page.locator("#email").fill(value);
});

When(
  "il saisit le mot de passe {string}",
  async ({ page, ctx }, value: string) => {
    ctx.password = value;
    await page.locator("#password").fill(value);
  },
);

When(
  "il saisit {string} comme mot de passe",
  async ({ page }, value: string) => {
    await page.locator("#password").fill(value);
  },
);

When(
  "il saisit {string} comme ancien mot de passe",
  async ({ page }, value: string) => {
    await page.locator("#oldpassword").fill(value);
  },
);

When(
  "il saisit {string} comme nouveau mot de passe",
  async ({ page, ctx }, value: string) => {
    ctx.newPassword = value;
    await page.locator("#newpassword").fill(value);
  },
);

When("il confirme {string}", async ({ page }, value: string) => {
  await page.locator("#confirmpassword").fill(value);
});

When("il valide le formulaire", async ({ page }) => {
  await page
    .getByRole("button", { name: /^(Se connecter|Créer le compte)$/ })
    .click();
});
