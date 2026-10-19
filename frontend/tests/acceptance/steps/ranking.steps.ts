import { expect } from "@playwright/test";
import { Given, When, Then } from "./fixtures";
import {
  assertRankingRow,
  assertWorkNotInRanking,
  setupRankingsMock,
  type ScenarioRankingWork,
} from "../utils/rankings";

/* =========================================================================
 * 1. Backgrounds & Works preparation (1020, 1021)
 * ========================================================================= */

function parseWorksTable(raw: any): ScenarioRankingWork[] {
  if (!raw) return [];

  if (typeof raw.hashes === "function") {
    return raw.hashes().map((row: Record<string, string>) => ({
      title: row["Œuvre"] ?? row["Oeuvre"] ?? row["title"] ?? row["Titre"] ?? "",
      category: row["Catégorie"] ?? row["Categorie"] ?? row["category"] ?? "",
      score: Number(row["Score"] ?? row["score"] ?? 0),
    }));
  }

  const rows = raw?.dataTable?.rows ?? raw?.rows;
  if (Array.isArray(rows) && rows.length > 1) {
    const headers = rows[0].cells.map((c: any) => c.value);
    const results: ScenarioRankingWork[] = [];
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].cells.map((c: any) => c.value);
      const rowObj: Record<string, string> = {};
      headers.forEach((h: string, idx: number) => {
        rowObj[h] = values[idx] ?? "";
      });
      results.push({
        title: rowObj["Œuvre"] ?? rowObj["Oeuvre"] ?? rowObj["title"] ?? rowObj["Titre"] ?? "",
        category: rowObj["Catégorie"] ?? rowObj["Categorie"] ?? rowObj["category"] ?? "",
        score: Number(rowObj["Score"] ?? rowObj["score"] ?? 0),
      });
    }
    return results;
  }

  return [];
}

Given(
  "les œuvres publiées suivantes existent dans des catégories différentes :",
  async ({ page, ctx }, dataTable: any) => {
    ctx.rankingWorks = parseWorksTable(dataTable);
    await setupRankingsMock(page, () => (ctx.rankingWorks as ScenarioRankingWork[]) ?? []);
  },
);

Given(
  "les œuvres publiées suivantes existent :",
  async ({ page, ctx }, dataTable: any) => {
    ctx.rankingWorks = parseWorksTable(dataTable);
    await setupRankingsMock(page, () => (ctx.rankingWorks as ScenarioRankingWork[]) ?? []);
  },
);

/* =========================================================================
 * 2. Temporal Given steps (1022, 1023, 1024)
 * ========================================================================= */

Given(
  "l'œuvre {string} a reçu un vote positif aujourd'hui",
  async ({ page, ctx }, title: string) => {
    ctx.rankingWorks = ctx.rankingWorks ?? [];
    const list = ctx.rankingWorks as ScenarioRankingWork[];
    list.push({ title, category: "Photographie", score: 1 });
    await setupRankingsMock(page, () => list);
  },
);

Given(
  "l'œuvre {string} a reçu un vote positif hier, hors de la période du jour en cours",
  async ({}, _title: string) => {
    // Vote was outside "today" window, so score for "jour" remains 0
  },
);

Given(
  "l'œuvre {string} a reçu un vote positif au cours de la semaine en cours",
  async ({ page, ctx }, title: string) => {
    ctx.rankingWorks = ctx.rankingWorks ?? [];
    const list = ctx.rankingWorks as ScenarioRankingWork[];
    list.push({ title, category: "Photographie", score: 1 });
    await setupRankingsMock(page, () => list);
  },
);

Given(
  "l'œuvre {string} a reçu un vote positif la semaine précédente",
  async ({}, _title: string) => {
    // Vote was outside "week" window
  },
);

Given(
  "l'œuvre {string} a reçu un vote positif au cours du mois en cours",
  async ({ page, ctx }, title: string) => {
    ctx.rankingWorks = ctx.rankingWorks ?? [];
    const list = ctx.rankingWorks as ScenarioRankingWork[];
    list.push({ title, category: "Photographie", score: 1 });
    await setupRankingsMock(page, () => list);
  },
);

Given(
  "l'œuvre {string} a reçu un vote positif le mois précédent",
  async ({}, _title: string) => {
    // Vote was outside "month" window
  },
);

/* =========================================================================
 * 3. When steps (Consultation)
 * ========================================================================= */

When("l'utilisateur consulte le classement global", async ({ page }) => {
  await page.goto("/rankings");
  await expect(page.locator("table")).toBeVisible();
});

When(
  "l'utilisateur consulte le classement de la catégorie {string}",
  async ({ page }, category: string) => {
    await page.goto(`/rankings?category=${encodeURIComponent(category)}`);
    await expect(page.locator("table")).toBeVisible();
  },
);

When(
  "l'utilisateur consulte le classement {string}",
  async ({ page }, period: string) => {
    await page.goto(`/rankings?period=${encodeURIComponent(period)}`);
    await expect(page.locator("table")).toBeVisible();
  },
);

/* =========================================================================
 * 4. Then steps (Assertions)
 * ========================================================================= */

Then(
  "l'œuvre {string} apparaît en position {int} avec un score de {int}",
  async ({ page }, title: string, position: number, score: number) => {
    await assertRankingRow(page, title, position, score);
  },
);

Then(
  "l'œuvre {string} n'apparaît pas dans ce classement",
  async ({ page }, title: string) => {
    await assertWorkNotInRanking(page, title);
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

Then(
  "le vote de {string} est comptabilisé dans ce classement",
  async ({ page }, title: string) => {
    await assertRankingRow(page, title, undefined, 1);
  },
);

Then(
  "le vote de {string} datant de la semaine précédente n'est pas comptabilisé dans ce classement",
  async ({ page }, title: string) => {
    await assertWorkNotInRanking(page, title);
  },
);

Then(
  "le vote de {string} datant du mois précédent n'est pas comptabilisé dans ce classement",
  async ({ page }, title: string) => {
    await assertWorkNotInRanking(page, title);
  },
);
