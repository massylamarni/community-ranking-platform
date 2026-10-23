// Feature: Modification du vote
import { expect } from "@playwright/test";
import { When, Then } from "../fixtures";
import { openFirstWork } from "../common/shared.steps";

When("l'utilisateur modifie son vote en vote négatif", async ({ page }) => {
  await openFirstWork(page);
  await page.getByRole("button", { name: /Downvote/ }).click();
});

When("l'utilisateur modifie son vote en vote positif", async ({ page }) => {
  await openFirstWork(page);
  await page.getByRole("button", { name: /Upvote/ }).click();
});

Then("le vote de l'utilisateur devient négatif", async ({ page }) => {
  await openFirstWork(page);
  expect(
    await page
      .getByRole("button", { name: "Downvote" })
      .getAttribute("aria-pressed"),
  ).toBeTruthy();
});

Then("le vote de l'utilisateur devient positif", async ({ page }) => {
  await openFirstWork(page);
  expect(
    await page
      .getByRole("button", { name: "Upvote" })
      .getAttribute("aria-pressed"),
  ).toBeTruthy();
});
