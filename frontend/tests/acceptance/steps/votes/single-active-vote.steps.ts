// Feature: Un seul vote actif par utilisateur
import { Given, When, Then } from "../fixtures";
import { expect } from "@playwright/test";

Given(
  "l'utilisateur possède déjà un vote actif sur cette œuvre",
  async ({ page }) => {
    const activeVote = page.locator(
      'button[aria-label="Upvote"].bg-primary, button[aria-label="Downvote"].bg-primary',
    );
    if ((await activeVote.count()) === 0) {
      await page.getByRole("button", { name: /Upvote/ }).click();
    }
    await expect(activeVote).toHaveCount(1);
  },
);

When(
  "l'utilisateur tente d'attribuer un nouveau vote à cette œuvre",
  async ({ page }) => {
    const downvote = page.getByRole("button", { name: /Downvote/ });
    const upvote = page.getByRole("button", { name: /Upvote/ });
    if (await page.locator('button[aria-label="Upvote"].bg-primary').count()) {
      await downvote.click();
    } else {
      await upvote.click();
    }
  },
);

Then("le système ne crée pas un second vote actif", async ({ page }) => {
  const activeVotes = page.locator(
    'button[aria-label="Upvote"].bg-primary, button[aria-label="Downvote"].bg-primary',
  );
  await expect.poll(() => activeVotes.count()).toBeLessThan(2);
});

Then(
  "un seul vote reste actif pour cet utilisateur sur cette œuvre",
  async ({ page }) => {
    await expect(
      page.locator(
        'button[aria-label="Upvote"].bg-primary, button[aria-label="Downvote"].bg-primary',
      ),
    ).toHaveCount(1);
  },
);
