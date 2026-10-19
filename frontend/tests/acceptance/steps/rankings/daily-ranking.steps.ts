// Feature: Classement quotidien
import { expect } from "@playwright/test";
import { Given, When, Then } from "../fixtures";
import {
  assertRankingRow,
  assertWorkNotInRanking,
  getOrCreateRankingWorks,
  setupRankingsMock,
} from "../../utils/rankings";

Given(
  "l'œuvre {string} a reçu un vote positif aujourd'hui",
  async ({ page, ctx }, title: string) => {
    const list = getOrCreateRankingWorks(ctx);
    list.push({ title, category: "Photographie", score: 1 });
    await setupRankingsMock(page, () => list);
  },
);

Given(
  "l'œuvre {string} a reçu un vote positif hier, hors de la période du jour en cours",
  async () => {
    // The vote is outside the current day's ranking period.
  },
);

When(
  "l'utilisateur consulte le classement {string}",
  async ({ page }, period: string) => {
    await page.goto(`/rankings?period=${encodeURIComponent(period)}`);
    await expect(page.locator("table")).toBeVisible();
  },
);

Then(
  "le vote d'aujourd'hui sur {string} est comptabilisé dans ce classement",
  async ({ page }, title: string) => {
    await assertRankingRow(page, title, undefined, 1);
  },
);

Then(
  "le vote d'hier sur {string} n'est pas comptabilisé dans ce classement",
  async ({ page }, title: string) => {
    await assertWorkNotInRanking(page, title);
  },
);
