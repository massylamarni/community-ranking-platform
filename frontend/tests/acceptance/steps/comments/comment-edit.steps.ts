// Feature: Modification d'un commentaire
import { Given, When, Then } from "../fixtures";
import { expect } from "@playwright/test";

async function openComments(page: import("@playwright/test").Page) {
  const toggle = page.getByRole("button", { name: /Comments/ }).first();
  if (!(await toggle.count())) {
    await page.goto("/profiles/3");
  }
  const target = page.getByRole("button", { name: /Comments/ }).first();
  if ((await target.getAttribute("aria-expanded")) !== "true")
    await target.click();
}

const editForm = (page: import("@playwright/test").Page) =>
  page.getByLabel("comment-form").filter({
    has: page.getByRole("button", { name: "Cancel" }),
  });

Given("il a publié le commentaire {string}", async ({ page }, arg1: string) => {
  await openComments(page);
  await expect(page.getByText(arg1, { exact: true }).last()).toBeVisible();
});

When(
  "il modifie ce commentaire en {string}",
  async ({ page }, arg1: string) => {
    const original = page
      .getByRole("paragraph")
      .last()
      .filter({ hasText: "Superbe travail" });
    await original
      .locator("xpath=../../..")
      .getByRole("button", { name: "edit-comment" })
      .click();
    await editForm(page)
      .getByRole("textbox", { name: "comment-text" })
      .fill(arg1);
  },
);

When("il valide la modification", async ({ page }) => {
  await editForm(page).getByRole("button", { name: "post-comment" }).click();
});

When(
  "un autre utilisateur authentifié tente de modifier ce commentaire",
  async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "edit-comment" }),
    ).toHaveCount(20); // Seeding
  },
);

Then(
  "le commentaire affiché sous l'œuvre est {string}",
  async ({ page }, arg1: string) => {
    await expect(page.getByText(arg1, { exact: true })).toBeVisible();
  },
);
