// Feature: Affichage du vote de l'utilisateur
import { openFirstWork } from "../common/shared.steps";
import { Given, When, Then } from "../fixtures";
import { expect } from "@playwright/test";

Given("l'utilisateur n'a pas voté pour une œuvre", async ({ page }) => {
  await expect(
    page.locator(
      'button[aria-label="Upvote"].bg-primary, button[aria-label="Downvote"].bg-primary',
    ),
  ).toHaveCount(0);
});

When("l'utilisateur consulte l'œuvre", async ({ page }) => {
  await openFirstWork(page);
  await expect(page.getByRole("button", { name: /Upvote/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Downvote/ })).toBeVisible();
});

Then(
  "l'interface indique que le vote positif est actuellement sélectionné",
  async ({ page }) => {
    expect(
      await page
        .getByRole("button", { name: "Upvote" })
        .getAttribute("aria-pressed"),
    ).toBeTruthy();
  },
);

Then(
  "l'interface indique que le vote négatif est actuellement sélectionné",
  async ({ page }) => {
    expect(
      await page
        .getByRole("button", { name: "Downvote" })
        .getAttribute("aria-pressed"),
    ).toBeTruthy();
  },
);

Then(
  "aucun vote n'est indiqué comme actuellement sélectionné",
  async ({ page }) => {
    await expect(
      page.locator(
        'button[aria-label="Upvote"].bg-primary, button[aria-label="Downvote"].bg-primary',
      ),
    ).toHaveCount(0);
  },
);
