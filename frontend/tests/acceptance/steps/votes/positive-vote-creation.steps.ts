// Feature: Création d'un vote positif
import { When, Then } from "../fixtures";
import { expect } from "@playwright/test";

When("l'utilisateur attribue un vote positif à l'œuvre", async ({ page }) => {
  await page.getByRole("button", { name: /Upvote/ }).click();
});

Then("le vote positif est enregistré", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Upvote/ })).toHaveClass(
    /bg-primary/,
  );
});
