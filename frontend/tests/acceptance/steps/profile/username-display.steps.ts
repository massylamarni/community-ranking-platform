// Feature: Affichage du pseudo
import { resolveUsername } from "../common/shared.steps";
import { Then } from "../fixtures";
import { expect } from "@playwright/test";

Then("le pseudo {string} est affiché", async ({ page }, username: string) => {
  await expect(
    page.getByText(resolveUsername(username), { exact: true }).last(),
  ).toBeVisible();
});
