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
  "un compte existe avec l'adresse e-mail {string}",
  async ({ request, ctx }, value: string) => {
    const account = { ...newAccount(), email: value };
    ctx.email = value;
    await directRegister(request, account);
  },
);

Given(
  "l'utilisateur demande à réinitialiser son mot de passe",
  async ({ page }) => {
    await page.goto("/auth/forgotpassword");
  },
);

Then(
  "une procédure de réinitialisation est envoyée à cette adresse e-mail",
  async ({}) => {
    // TODO: implement
  },
);

When("il valide la demande", async ({ page }) => {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith("/backend-api/auth/password/forgot"),
  );
  await page
    .getByRole("button", { name: "Envoyer le code", exact: true })
    .click();
  const response = await responsePromise;
  expect(response.status()).toBe(202);
});

Then("le mot de passe est modifié", async ({ page }) => {
  await expect(page).toHaveURL(/\/auth\/changepassword$/);
});

Then(
  "il peut se connecter avec {string}",
  async ({ request, page, ctx }, value: string) => {
    const account = { ...(ctx.account as LoginUserPayload), password: value };
    await directLogout(request);
    await login(page, account);
  },
);
