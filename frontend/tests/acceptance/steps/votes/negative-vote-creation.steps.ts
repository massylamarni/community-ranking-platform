// Feature: Création d'un vote négatif
import { When, Then } from "../fixtures";
import { expect } from "@playwright/test";

When("l'utilisateur attribue un vote négatif à l'œuvre", async ({ page }) => {
  await page.getByRole("button", { name: /Downvote/ }).click();
});

Then("le vote négatif est enregistré", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Downvote/ })).toHaveClass(
    /bg-primary/,
  );
});
