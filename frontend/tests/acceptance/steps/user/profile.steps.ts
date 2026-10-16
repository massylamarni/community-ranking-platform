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
  "son profil contient le pseudo {string}",
  async ({ page }, value: string) => {
    await expect(page.locator("#username")).toHaveValue(value);
  },
);

Given(
  "son profil contient l'adresse e-mail {string}",
  async ({ page }, value: string) => {
    await expect(page.locator("#email")).toHaveValue(value);
  },
);

When("elle consulte son profil", async ({ page }) => {
  await page.goto("/auth/profile");
});

Then("son pseudo {string} est affiché", async ({ page }, value: string) => {
  await expect(page.locator("#username")).toHaveValue(value);
});

When(
  "elle modifie une information autorisée de son profil",
  async ({ page, ctx }) => {
    const account = ctx.account as OwnProfile;
    const updatedEmail = `updated_${account.username}@example.com`;
    ctx.updatedEmail = updatedEmail;
    await page.goto("/auth/profile");
    await page.locator("#email").fill(updatedEmail);
  },
);

When("elle valide les modifications", async ({ page, ctx }) => {
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  const updatedProfile = await waitForProfileUpdate(page);
  expect(updatedProfile.email).toBe(ctx.updatedEmail);
});

Then("la nouvelle information est enregistrée", async ({ page, ctx }) => {
  const profile = await getProfile(page);
  expect(profile.email).toBe(ctx.updatedEmail);
});

Then(
  "la nouvelle information est affichée dans son profil",
  async ({ page, ctx }) => {
    await expect(page.locator("#email")).toHaveValue(String(ctx.updatedEmail));
  },
);

/*
When(
  "l'utilisateur saisit {string} comme identifiant",
  async ({}, str: string) => {
    // TODO: implement
  },
);
*/
