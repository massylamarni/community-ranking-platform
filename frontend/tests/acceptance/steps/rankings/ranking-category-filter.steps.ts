// Feature: Filtrage du classement par catégorie
import { expect } from "@playwright/test";
import { Given, When, Then } from "../fixtures";
import {
  clickFilterButton,
  getOrCreateRankingWorks,
  selectCategoryFilter,
  setupRankingsMock,
} from "../../utils/rankings";

Given(
  "l'utilisateur consulte le classement global comportant des œuvres de plusieurs catégories",
  async ({ page, ctx }) => {
    if (ctx.rankingWorks === undefined) {
      ctx.rankingWorks = [
        { title: "Symphonie No 5", category: "Musique", score: 25 },
        { title: "Clair de Lune", category: "Musique", score: 18 },
        { title: "Lumière d'Automne", category: "Photographie", score: 15 },
        { title: "Le Cri Silencieux", category: "Peinture", score: 10 },
      ];
      await setupRankingsMock(page, () => getOrCreateRankingWorks(ctx));
    }
    await page.goto("/rankings");
    await expect(page.locator("table")).toBeVisible();
  },
);

When(
  "il sélectionne le filtre {string}",
  async ({ page }, filterSpec: string) => {
    const match = filterSpec.match(/Catégorie\s*:\s*(.+)/i);
    const categoryName = match ? match[1].trim() : filterSpec;
    await selectCategoryFilter(page, categoryName);
  },
);

When("il valide le filtre", async ({ page }) => {
  await clickFilterButton(page);
});

Then(
  "seules les œuvres de la catégorie {string} restent affichées",
  async ({ page }, category: string) => {
    const badges = page.locator("tbody tr td:nth-child(3)");
    await expect(async () => {
      const count = await badges.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await expect(badges.nth(i)).toContainText(category);
      }
    }).toPass({ timeout: 5000 });
  },
);

Then("elles restent triées par score", async ({ page }) => {
  const scoreCells = page.locator("tbody tr td:last-child");
  const count = await scoreCells.count();
  const scores: number[] = [];
  for (let i = 0; i < count; i++) {
    const text = await scoreCells.nth(i).textContent();
    const score = parseInt(text?.trim() ?? "0", 10);
    if (!isNaN(score)) scores.push(score);
  }
  for (let i = 0; i < scores.length - 1; i++) {
    expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
  }
});
