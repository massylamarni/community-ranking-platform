// Feature: Identification de l'auteur
import { resolveUsername } from "../common/shared.steps";
import { When, Then } from "../fixtures";
import { expect } from "@playwright/test";

When("l'œuvre est consultée", async ({ page }) => {
  if (!(await page.getByRole("button", { name: /Comments/ }).count())) {
    await page.goto("/rankings");
    await page.getByRole("row").nth(1).getByRole("link").first().click();
  }
  const comments = page.getByRole("button", { name: /Comments/ });
  if (
    !(await comments.getAttribute("aria-expanded")) ||
    (await comments.getAttribute("aria-expanded")) !== "true"
  ) {
    await comments.click();
  }
});

Then(
  "le commentaire affiché indique {string} comme auteur",
  async ({ page }, username: string) => {
    await expect(
      page.getByText(resolveUsername(username), { exact: true }).first(),
    ).toBeVisible();
  },
);
