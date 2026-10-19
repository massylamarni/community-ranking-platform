import { expect, type Page } from "@playwright/test";
import type { RankingEntry, SpringPage } from "@/types/api";

export interface ScenarioRankingWork {
  title: string;
  category: string;
  score: number;
}

export function buildRankingSpringPage(
  items: ScenarioRankingWork[],
): SpringPage<RankingEntry> {
  const content: RankingEntry[] = items.map((w, index) => ({
    id: index + 1,
    position: index + 1,
    title: w.title,
    author: { id: index + 1, username: `artiste_${w.title.toLowerCase()}` },
    description: `Description pour ${w.title}`,
    categories: [w.category],
    score: w.score,
    imageUrl: null,
  }));

  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    size: 20,
    number: 0,
    first: true,
    last: true,
  };
}

export async function setupRankingsMock(
  page: Page,
  getItems: () => ScenarioRankingWork[],
) {
  const getCategories = () => {
    const items = getItems() ?? [];
    const uniqueCats = Array.from(new Set(items.map((i) => i.category))).filter(Boolean);
    const standard = ["Musique", "Photographie", "Théâtre", "Peinture", "Sculpture", "Design"];
    const allNames = Array.from(new Set([...uniqueCats, ...standard]));
    return allNames.map((name, idx) => ({ id: idx + 1, name }));
  };

  // Categories list mock
  await page.route("**/backend-api/categories**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(getCategories()),
      });
      return;
    }
    await route.continue();
  });

  await page.route("**/backend-api/rankings**", async (route) => {
    const url = new URL(route.request().url());

    // Periods for archive
    if (url.pathname.endsWith("/periods") || url.pathname.includes("/periods")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(["2026-10-12", "2026-10-05"]),
      });
      return;
    }

    const items = getItems() ?? [];

    const categoryParam =
      url.searchParams.get("categoryId") || url.searchParams.get("category");

    let filtered = [...items];

    if (categoryParam && categoryParam !== "all") {
      const categories = getCategories();
      const numId = Number(categoryParam);
      const matchedCat = !isNaN(numId)
        ? categories.find((c) => c.id === numId)
        : categories.find(
            (c) => c.name.toLowerCase() === categoryParam.toLowerCase(),
          );
      const targetName = matchedCat
        ? matchedCat.name.toLowerCase()
        : categoryParam.toLowerCase();

      filtered = filtered.filter(
        (item) => item.category.toLowerCase() === targetName,
      );
    }

    // Sort by score descending
    filtered.sort((a, b) => b.score - a.score);

    const springPage = buildRankingSpringPage(filtered);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(springPage),
    });
  });
}

export async function selectCategoryFilter(page: Page, categoryName: string) {
  const trigger = page
    .locator('#category-select, [aria-label="Catégorie"]')
    .first();
  await trigger.click();
  await page.getByRole("option", { name: categoryName }).click();
}

export async function selectPeriodFilter(page: Page, periodLabel: string) {
  const trigger = page
    .locator(
      '#period-select, [aria-label="Période"], [aria-label="Période archivée"]',
    )
    .first();
  await trigger.click();
  await page
    .getByRole("option", { name: new RegExp(periodLabel, "i") })
    .first()
    .click();
}

export async function clickFilterButton(page: Page) {
  const filterBtn = page.getByRole("button", { name: /filtrer/i });
  await Promise.all([
    page
      .waitForResponse(
        (resp) =>
          resp.url().includes("/backend-api/rankings") && resp.status() === 200,
        { timeout: 5000 },
      )
      .catch(() => {}),
    filterBtn.click(),
  ]);
}

export async function assertRankingRow(
  page: Page,
  title: string,
  position?: number,
  score?: number,
) {
  const row = page
    .locator("tbody tr")
    .filter({
      has: page
        .locator("td:nth-child(2)")
        .getByText(title, { exact: true }),
    })
    .first();
  await expect(row).toBeVisible();
  if (position !== undefined) {
    await expect(row.locator("td").first()).toContainText(String(position));
  }
  if (score !== undefined) {
    await expect(row.locator("td").last()).toContainText(String(score));
  }
}

export async function assertWorkNotInRanking(page: Page, title: string) {
  const row = page.locator("tbody tr").filter({
    has: page
      .locator("td:nth-child(2)")
      .getByText(title, { exact: true }),
  });
  await expect(row).toHaveCount(0);
}
