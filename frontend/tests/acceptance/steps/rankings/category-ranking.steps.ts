// Feature: Classement par catégorie
import { expect } from "@playwright/test";
import { Given, When, Then } from "../fixtures";
import {
  assertWorkNotInRanking,
  getOrCreateRankingWorks,
  parseRankingWorksTable,
  setupRankingsMock,
  type RankingWorksTable,
} from "../../utils/rankings";

Given(
  "les œuvres publiées suivantes existent :",
  async ({ page, ctx }, dataTable: RankingWorksTable) => {
    ctx.rankingWorks = parseRankingWorksTable(dataTable);
    await setupRankingsMock(page, () => getOrCreateRankingWorks(ctx));
  },
);

When(
  "l'utilisateur consulte le classement de la catégorie {string}",
  async ({ page }, category: string) => {
    await page.goto(`/rankings?category=${encodeURIComponent(category)}`);
    await expect(page.locator("table")).toBeVisible();
  },
);

Then(
  "l'œuvre {string} n'apparaît pas dans ce classement",
  async ({ page }, title: string) => {
    await assertWorkNotInRanking(page, title);
  },
);
