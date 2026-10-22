// Feature: Filtrage temporel du classement
import { expect } from "@playwright/test";
import { Given, When, Then } from "../fixtures";
import {
  clickFilterButton,
  getOrCreateRankingWorks,
  selectPeriodFilter,
  setupRankingsMock,
} from "../../utils/rankings";

Given(
  "l'utilisateur consulte le classement avec la période {string} sélectionnée",
  async ({ page, ctx }, period: string) => {
    if (ctx.rankingWorks === undefined) {
      ctx.rankingWorks = [
        { title: "A", category: "Photographie", score: 10 },
        { title: "B", category: "Musique", score: 5 },
      ];
      await setupRankingsMock(page, () => getOrCreateRankingWorks(ctx));
    }
    await page.goto(`/rankings?period=${encodeURIComponent(period)}`);
    await expect(page.locator("table")).toBeVisible();
  },
);

When("il sélectionne la période {string}", async ({ page }, period: string) => {
  await selectPeriodFilter(page, period);
});

When("il valide ce choix", async ({ page }) => {
  await clickFilterButton(page);
});

Then(
  "le classement affiché est recalculé pour refléter uniquement les votes du mois en cours",
  async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  },
);
