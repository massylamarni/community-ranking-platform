import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { loginAs } from "../common/shared.steps";
import { Given, When, Then } from "../fixtures";

// TODO, HARDCODE
async function api<T = unknown>(
  page: Page,
  method: "GET" | "POST",
  path: string,
  data?: unknown,
): Promise<T> {
  const baseUrl =
    page.url() === "about:blank" ? "http://127.0.0.1:3100" : page.url();
  const response = await page
    .context()
    .request.fetch(new URL(`/backend-api${path}`, baseUrl).toString(), {
      method,
      data,
    });
  if (!response.ok()) {
    throw new Error(`${method} ${path} failed (${response.status()})`);
  }
  return (await response.json()) as T;
}

// TODO, HARDCODE
async function seedCommentFromBob(page: Page): Promise<number> {
  const works = await api<{ id: number; title: string }[]>(
    page,
    "GET",
    "/works?status=approved",
  );
  const work = works.find((w) => w.title === "Le Cri Silencieux");
  if (!work) throw new Error("Le Cri Silencieux not found");

  await page.context().clearCookies();
  await loginAs(page, "bob");
  await api(page, "POST", `/works/${work.id}/comments`, {
    content: "Un commentaire de bob",
  });

  await page.context().clearCookies();
  await loginAs(page, "alice");
  return work.id;
}

async function openOwnWorkComments(page: Page) {
  if (!(await page.getByRole("button", { name: /Comments/ }).count())) {
    if (page.url() === "about:blank" || page.url().includes("/auth/login")) {
      await loginAs(page, "alice");
    }
    await page.goto("/works/mine");
    await page.getByRole("button", { name: "Voir" }).first().click();
    await page.waitForURL(/\/works\/\d+/);
  }
  const toggle = page.getByRole("button", { name: /Comments/ }).first();
  if ((await toggle.getAttribute("aria-expanded")) !== "true")
    await toggle.click();
}

Given("il consulte une œuvre qu'il a lui-même déposée", async ({ page }) => {
  await openOwnWorkComments(page);
  await expect(page.getByText(/propre travail/)).toBeVisible();
});

Given(
  "un autre utilisateur a publié un commentaire sur une œuvre appartenant à l'utilisateur authentifié",
  async ({ page }) => {
    const workId = await seedCommentFromBob(page);
    await page.goto(`/works/${workId}`);
    await openOwnWorkComments(page);
    await expect(
      page.getByRole("button", { name: "Reply" }).first(),
    ).toBeVisible();
  },
);

When(
  "il tente de publier un commentaire principal sur cette œuvre",
  async ({ page }) => {
    await expect(
      page.getByRole("textbox", { name: "comment-text" }),
    ).toHaveCount(0);
  },
);

When("l'auteur de l'œuvre répond à ce commentaire", async ({ page }) => {
  await page.getByRole("button", { name: "Reply" }).first().click();
  const form = page.getByLabel("comment-form").last();
  await form
    .getByRole("textbox", { name: "comment-text" })
    .fill("Réponse de l'auteur");
  await form.getByRole("button", { name: "post-comment" }).click();
});

Then("l'action est refusée par le système", async ({ page }) => {
  await expect(
    page.getByText(
      /Vous ne pouvez pas ajouter de commentaire de premier niveau/,
    ),
  ).toBeVisible();
});

Then(
  "un message indique qu'il ne peut pas commenter sa propre œuvre",
  async ({ page }) => {
    await expect(
      page.getByText(
        /Vous ne pouvez pas ajouter de commentaire de premier niveau/,
      ),
    ).toBeVisible();
  },
);

Then("la réponse est enregistrée", async ({ page }) => {
  await expect(
    page.getByText("Réponse de l'auteur", { exact: true }),
  ).toBeVisible();
});

Then("elle est affichée sous l'œuvre concernée", async ({ page }) => {
  await expect(
    page.getByText("Réponse de l'auteur", { exact: true }),
  ).toBeVisible();
});
