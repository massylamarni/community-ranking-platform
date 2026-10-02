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

Given(
  "un utilisateur non administrateur est authentifié",
  async ({ request }) => {
    const account = newAccount();
    await directRegister(request, account);
    await directLogin(request, account);
  },
);

Then("l'utilisateur est authentifié", async ({ page }) => {
  expect((await page.request.get("/backend-api/auth/me")).status()).toBe(200);
});

Then("l'utilisateur n'est pas authentifié", async ({ page }) => {
  expect((await page.request.get("/backend-api/auth/me")).status()).toBe(401);
});

Then("l'utilisateur n'est plus authentifié", async ({ page }) => {
  expect((await page.request.get("/backend-api/auth/me")).status()).toBe(401);
});

Given(
  "l'utilisateur {string} est authentifié",
  async ({ request, ctx }, username: string) => {
    const account = { ...newAccount(), username };
    await directRegister(request, account);
    await directLogin(request, account);
    ctx.account = account;
  },
);

When("il demande à se déconnecter", async ({ page }) => {
  await logout(page);
});

Then(
  "il est redirigé vers une page accessible aux visiteurs",
  async ({ page }) => {
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "Se connecter" }),
    ).toBeVisible();
  },
);

/*
When("il se déconnecte", async ({}) => {
  // TODO: implement
});
*/

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

Given("l'utilisateur est sur la page de connexion", async ({ page }) => {
  await page.goto("/auth/login");
});

Then(
  "l'utilisateur peut se connecter avec ses identifiants",
  async ({ page, ctx }) => {
    await login(page, {
      username: ctx.username,
      password: ctx.password,
    } as LoginUserPayload);
  },
);

Then("il est redirigé vers son espace utilisateur", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Mes œuvres" })).toBeVisible();
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
