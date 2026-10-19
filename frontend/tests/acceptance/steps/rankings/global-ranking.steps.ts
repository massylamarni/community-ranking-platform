// Feature: Classement global
import { expect } from "@playwright/test";
import { Given, When, Then } from "../fixtures";
import {
  assertRankingRow,
  getOrCreateRankingWorks,
  parseRankingWorksTable,
  setupRankingsMock,
  type RankingWorksTable,
} from "../../utils/rankings";

Given(
  "les œuvres publiées suivantes existent dans des catégories différentes :",
  async ({ page, ctx }, dataTable: RankingWorksTable) => {
    ctx.rankingWorks = parseRankingWorksTable(dataTable);
    await setupRankingsMock(page, () => getOrCreateRankingWorks(ctx));
  },
);

When("l'utilisateur consulte le classement global", async ({ page }) => {
  await page.goto("/rankings");
  await expect(page.locator("table")).toBeVisible();
});

Then(
  "l'œuvre {string} apparaît en position {int} avec un score de {int}",
  async ({ page }, title: string, position: number, score: number) => {
    await assertRankingRow(page, title, position, score);
  },
);
