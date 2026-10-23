// Feature: Suppression d'un commentaire
import { save, saved } from "../common/shared.steps";
import { Given, When, Then } from "../fixtures";
import { expect } from "@playwright/test";

async function openComments(page: import("@playwright/test").Page) {
  if (!(await page.getByRole("button", { name: /Comments/ }).count())) {
    await page.goto("/rankings");
    await page.getByRole("row").nth(1).getByRole("link").first().click();
  }
  const toggle = page.getByRole("button", { name: /Comments/ });
  if ((await toggle.getAttribute("aria-expanded")) !== "true")
    await toggle.click();
}

Given("un commentaire est publié sous une œuvre", async ({ page, ctx }) => {
  await openComments(page);
  const comment = page.locator("p").last();
  await expect(comment).toBeVisible();
  console.log(await comment.innerText());
  save(ctx, "commentContent", await comment.innerText());
});

When("il supprime ce commentaire", async ({ page }) => {
  if (!(await page.getByRole("button", { name: "delete-comment" }).count()))
    await openComments(page);
  await page.getByRole("button", { name: "delete-comment" }).last().click();
  await page.getByRole("button", { name: "Confirmer" }).click();
});

When("je supprime ce commentaire", async ({ page }) => {
  if (!(await page.getByRole("button", { name: "delete-comment" }).count()))
    await openComments(page);
  await page.getByRole("button", { name: "delete-comment" }).last().click();
  await page.getByRole("button", { name: "Confirmer" }).click();
});

When(
  "un autre utilisateur authentifié, ni auteur ni administrateur, tente de supprimer ce commentaire",
  async ({ page }) => {
    await openComments(page);
    await expect(
      page.getByRole("button", { name: "delete-comment" }),
    ).toHaveCount(2); // Db is seeded with 4 comments, 2 only are editable
  },
);

Then(
  "le commentaire n'est plus affiché sous l'œuvre",
  async ({ page, ctx }) => {
    const comment = (await saved(ctx, "commentContent")) as string;
    await expect(page.getByText(comment, { exact: true })).toHaveCount(0);
  },
);
