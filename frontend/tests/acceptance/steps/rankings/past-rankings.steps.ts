// Feature: Consultation des anciens classements
import { expect } from "@playwright/test";
import { Given, When, Then } from "../fixtures";
import {
  clickFilterButton,
  getOrCreateRankingWorks,
  selectPeriodFilter,
  setupRankingsMock,
} from "../../utils/rankings";

Given(
  "le classement hebdomadaire de la semaine précédente a été archivé avec le résultat {string}, {string}, {string}",
  async ({ page, ctx }, w1: string, w2: string, w3: string) => {
    ctx.archivedWorks = [
      { title: w1, category: "Peinture", score: 30 },
      { title: w2, category: "Photographie", score: 20 },
      { title: w3, category: "Sculpture", score: 10 },
    ];
    await setupRankingsMock(page, () =>
      getOrCreateRankingWorks(ctx, "archivedWorks"),
    );
  },
);

When("l'utilisateur accède à la section des classements précédents", async ({ page }) => {
  await page.goto("/rankings/archives");
  await expect(page.locator("table")).toBeVisible();
});

When("il sélectionne la semaine précédente", async ({ page }) => {
  await selectPeriodFilter(page, "Semaine");
  await clickFilterButton(page);
});

Then(
  "le classement affiché est exactement {string}, {string}, {string}",
  async ({ page }, w1: string, w2: string, w3: string) => {
    const rows = page.locator("tbody tr");
    await expect(rows.nth(0)).toContainText(w1);
    await expect(rows.nth(1)).toContainText(w2);
    await expect(rows.nth(2)).toContainText(w3);
  },
);
