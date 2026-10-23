// Feature: Interdiction de voter sa propre œuvre
import { expect } from "@playwright/test";
import { When, Then } from "../fixtures";
import { saved } from "../common/shared.steps";
import { Work } from "@/types/api";

When(
  "l'utilisateur tente d'attribuer un vote positif à son œuvre",
  async ({ page, ctx }) => {
    const work = saved(ctx, "work") as Work;
    page.goto(`/works/${work.id}`);
    const upvote = page.getByRole("button", { name: /Upvote/ });
    if (await upvote.isEnabled()) await upvote.click();
  },
);

When(
  "l'utilisateur tente d'attribuer un vote négatif à son œuvre",
  async ({ page, ctx }) => {
    const work = saved(ctx, "work") as Work;
    page.goto(`/works/${work.id}`);
    const downvote = page.getByRole("button", { name: /Downvote/ });
    if (await downvote.isEnabled()) await downvote.click();
  },
);

Then("le vote est refusé", async ({ page }) => {
  await expect(
    page.locator(
      'button[aria-label="Upvote"].bg-primary, button[aria-label="Downvote"].bg-primary',
    ),
  ).toHaveCount(0);
});
