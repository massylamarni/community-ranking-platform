// Feature: Création d'un commentaire
import { loginAs, openFirstWork } from "../common/shared.steps";
import { Given, When, Then } from "../fixtures";
import { expect } from "@playwright/test";

Given(
  "un utilisateur authentifié consulte une œuvre qu'il n'a pas déposée",
  async ({ page }) => {
    await loginAs(page, "alice");
    await openFirstWork(page);
    await expect(
      page.getByRole("textbox", { name: "comment-text" }),
    ).toBeVisible();
  },
);

Given("un visiteur non authentifié consulte une œuvre", async ({ page }) => {
  await openFirstWork(page);
  await expect(
    page.getByText("Connectez-vous pour participer à la discussion."),
  ).toBeVisible();
});

When("il rédige le commentaire {string}", async ({ page }, arg1: string) => {
  await page.getByRole("textbox", { name: "comment-text" }).fill(arg1);
});

When(
  "il tente de publier le commentaire {string}",
  async ({ page }, arg1: string) => {
    await expect(
      page.getByRole("textbox", { name: "comment-text" }),
    ).toHaveCount(0);
    await expect(page.getByText(arg1, { exact: true })).toHaveCount(0);
  },
);

Then(
  "le commentaire {string} est enregistré",
  async ({ page }, arg1: string) => {
    await expect(
      page.locator("p").filter({ hasText: arg1 }).last(),
    ).toBeVisible();
  },
);

Then(
  "il est affiché sous l'œuvre concernée avec son auteur",
  async ({ page }) => {
    await expect(
      page.locator("p").filter({ hasText: /\S/ }).last(),
    ).toBeVisible();
  },
);

Then("le système l'empêche de publier le commentaire", async ({ page }) => {
  await expect(
    page.getByText("Connectez-vous pour participer à la discussion."),
  ).toBeVisible();
});

Then("le commentaire n'est pas enregistré", async ({ page }) => {
  await expect(
    page.locator("p").filter({ hasText: "Superbe travail" }),
  ).toHaveCount(0);
});

Then(
  "un message indique qu'il doit être connecté pour commenter",
  async ({ page }) => {
    await expect(
      page.getByText("Connectez-vous pour participer à la discussion."),
    ).toBeVisible();
  },
);
