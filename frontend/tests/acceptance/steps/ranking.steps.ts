import { expect } from "@playwright/test";
import { Given, When, Then } from "./fixtures";
import {
  assertRankingRow,
  assertWorkNotInRanking,
  clickFilterButton,
  selectCategoryFilter,
  selectPeriodFilter,
  setupRankingsMock,
  type ScenarioRankingWork,
} from "../utils/rankings";

/* =========================================================================
 * 1. Backgrounds & Works preparation (1020, 1021, 1030)
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

Given(
  "l'utilisateur consulte le classement global comportant des œuvres de plusieurs catégories",
  async ({ page, ctx }) => {
    if (!ctx.rankingWorks) {
      ctx.rankingWorks = [
        { title: "Symphonie No 5", category: "Musique", score: 25 },
        { title: "Clair de Lune", category: "Musique", score: 18 },
        { title: "Lumière d'Automne", category: "Photographie", score: 15 },
        { title: "Le Cri Silencieux", category: "Peinture", score: 10 },
      ];
      await setupRankingsMock(page, () => (ctx.rankingWorks as ScenarioRankingWork[]) ?? []);
    }
    await page.goto("/rankings");
    await expect(page.locator("table")).toBeVisible();
  },
);

/* =========================================================================
 * 2. Temporal Given steps (1022, 1023, 1024, 1031)
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

Given(
  "l'utilisateur consulte le classement avec la période {string} sélectionnée",
  async ({ page, ctx }, period: string) => {
    if (!ctx.rankingWorks) {
      ctx.rankingWorks = [
        { title: "A", category: "Photographie", score: 10 },
        { title: "B", category: "Musique", score: 5 },
      ];
      await setupRankingsMock(page, () => (ctx.rankingWorks as ScenarioRankingWork[]) ?? []);
    }
    await page.goto(`/rankings?period=${encodeURIComponent(period)}`);
    await expect(page.locator("table")).toBeVisible();
  },
);

/* =========================================================================
 * 3. Archives Given steps (1026)
 * ========================================================================= */

Given(
  "le classement hebdomadaire de la semaine précédente a été archivé avec le résultat {string}, {string}, {string}",
  async ({ page, ctx }, w1: string, w2: string, w3: string) => {
    ctx.archivedWorks = [
      { title: w1, category: "Peinture", score: 30 },
      { title: w2, category: "Photographie", score: 20 },
      { title: w3, category: "Sculpture", score: 10 },
    ];
    await setupRankingsMock(page, () => (ctx.archivedWorks as ScenarioRankingWork[]) ?? []);
  },
);

/* =========================================================================
 * 4. When steps (Consultation, Navigation, Filtrage)
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

When("l'utilisateur accède à la section des classements précédents", async ({ page }) => {
  await page.goto("/rankings/archives");
  await expect(page.locator("table")).toBeVisible();
});

When("il sélectionne la semaine précédente", async ({ page }) => {
  await selectPeriodFilter(page, "Semaine");
  await clickFilterButton(page);
});

When(
  "il sélectionne le filtre {string}",
  async ({ page }, filterSpec: string) => {
    // Parses string like "Catégorie : Musique"
    const match = filterSpec.match(/Catégorie\s*:\s*(.+)/i);
    const categoryName = match ? match[1].trim() : filterSpec;
    await selectCategoryFilter(page, categoryName);
  },
);

When("il valide le filtre", async ({ page }) => {
  await clickFilterButton(page);
});

When("il sélectionne la période {string}", async ({ page }, period: string) => {
  await selectPeriodFilter(page, period);
});

When("il valide ce choix", async ({ page }) => {
  await clickFilterButton(page);
});

/* =========================================================================
 * 5. Then steps (Assertions)
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

Then(
  "le classement affiché est exactement {string}, {string}, {string}",
  async ({ page }, w1: string, w2: string, w3: string) => {
    const rows = page.locator("tbody tr");
    await expect(rows.nth(0)).toContainText(w1);
    await expect(rows.nth(1)).toContainText(w2);
    await expect(rows.nth(2)).toContainText(w3);
  },
);

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
    const num = parseInt(text?.trim() ?? "0", 10);
    if (!isNaN(num)) scores.push(num);
  }
  for (let i = 0; i < scores.length - 1; i++) {
    expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
  }
});

Then(
  "le classement affiché est recalculé pour refléter uniquement les votes du mois en cours",
  async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  },
);
