// Feature: Création d'un commentaire
import { Given, When, Then } from "../fixtures";
import { expect } from "@playwright/test";

async function loginAsAlice(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page.getByLabel("Nom d'utilisateur").fill("alice");
  await page.getByLabel("Mot de passe").fill("Password123!");
  await page.getByRole("button", { name: "auth-login" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth/login"));
}

async function openFirstWork(page: import("@playwright/test").Page) {
  await page.goto("/rankings");
  await page.getByRole("row").nth(1).getByRole("link").first().click();
  await page.getByRole("button", { name: /Comments/ }).click();
}

Given(
  "un utilisateur authentifié consulte une œuvre qu'il n'a pas déposée",
  async ({ page }) => {
    await loginAsAlice(page);
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
