// Feature: Gestion du profil utilisateur
import { Given, When, Then } from "../fixtures";
import { expect, type Page } from "@playwright/test";

type OwnProfileState = {
  user: { id: number; username: string; email: string; role: "user" } | null;
  profile: { id: number; username: string; email: string; role: "user" };
};

async function installProfileRoutes(page: Page, state: OwnProfileState) {
  await page.route("**/backend-api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(state.user),
    }),
  );
  await page.route("**/backend-api/profile", async (route) => {
    if (route.request().method() === "PATCH") {
      const updates = route.request().postDataJSON() as {
        username: string;
        email: string;
      };
      state.profile = { ...state.profile, ...updates };
      state.user = { ...state.profile };
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(state.profile),
    });
  });
}

Given(
  "son profil contient le pseudo {string}",
  async ({ page, ctx }, arg1: string) => {
    const profileState: OwnProfileState = {
      user: {
        id: 77,
        username: arg1,
        email: "alice@example.com",
        role: "user",
      },
      profile: {
        id: 77,
        username: arg1,
        email: "alice@example.com",
        role: "user",
      },
    };
    ctx.profileManagement = profileState;
    await installProfileRoutes(page, profileState);
  },
);

Given(
  "son profil contient l'adresse e-mail {string}",
  async ({ ctx }, arg1: string) => {
    const profileState = ctx.profileManagement as OwnProfileState;
    profileState.profile.email = arg1;
    if (profileState.user) profileState.user.email = arg1;
  },
);

When("il consulte son profil", async ({ page }) => {
  await page.goto("/auth/profile");
});

When("il modifie son pseudo en {string}", async ({ page }, arg1: string) => {
  if (!page.url().endsWith("/auth/profile")) await page.goto("/auth/profile");
  await page.getByLabel("Nom d'utilisateur").fill(arg1);
});

When("il valide les modifications", async ({ page }) => {
  await page.locator('button[form="profile-form"]').click();
});

Then("son pseudo {string} est affiché", async ({ page }, arg1: string) => {
  await expect(page.getByLabel("Nom d'utilisateur")).toHaveValue(arg1);
});

Then(
  "son adresse e-mail {string} est affichée",
  async ({ page }, arg1: string) => {
    await expect(page.getByLabel("Adresse e-mail")).toHaveValue(arg1);
    await page.unrouteAll();
  },
);

Then("son nouveau pseudo est {string}", async ({ page, ctx }, arg1: string) => {
  expect((ctx.profileManagement as OwnProfileState).profile.username).toBe(
    arg1,
  );
  await expect(page.getByLabel("Nom d'utilisateur")).toHaveValue(arg1);
});

Then(
  "son nouveau pseudo {string} est affiché dans son profil",
  async ({ page }, arg1: string) => {
    await expect(page.getByLabel("Nom d'utilisateur")).toHaveValue(arg1);
    await page.unrouteAll();
  },
);
