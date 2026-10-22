// Feature: Confidentialité de l'adresse e-mail
import { Given, Then } from "../fixtures";
import { expect, type Page } from "@playwright/test";

type PublicProfileData = {
  userId: number;
  username: string;
  publishedWorks: [];
  comments: [];
  votedWorks: [];
};

async function showPublicProfile(page: Page, username = "Frédégonde") {
  const profile: PublicProfileData = {
    userId: 77,
    username,
    publishedWorks: [],
    comments: [],
    votedWorks: [],
  };
  await page.route("**/backend-api/users/77/public_profile", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(profile),
    }),
  );
  await page.goto("/profiles/77");
  await expect(page.getByText(username, { exact: true })).toBeVisible();
}

Given(
  "l'utilisateur possede l'adresse e-mail {string}",
  async ({ ctx }, arg1: string) => {
    ctx.privateProfileEmail = arg1;
  },
);

Then(
  "l'adresse e-mail {string} n'est pas affichée",
  async ({ page, ctx }, arg1: string) => {
    expect(ctx.privateProfileEmail).toBe(arg1);
    await showPublicProfile(page);
    await expect(page.getByText(arg1, { exact: true })).toHaveCount(0);
    await page.unrouteAll();
  },
);
