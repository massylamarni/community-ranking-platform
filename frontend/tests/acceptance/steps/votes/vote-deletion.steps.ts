// Feature: Suppression du vote
import { openFirstWork } from "../common/shared.steps";
import { Given, When, Then } from "../fixtures";
import { expect } from "@playwright/test";

Given("l'utilisateur possède un vote actif sur une œuvre", async ({ page }) => {
  await openFirstWork(page);

  const upvote = page.getByRole("button", { name: "Upvote" });
  const downvote = page.getByRole("button", { name: "Downvote" });

  if (
    (await upvote.getAttribute("aria-pressed")) !== "true" &&
    (await downvote.getAttribute("aria-pressed")) !== "true"
  ) {
    await upvote.click();
  }

  await expect(
    page
      .getByRole("button", { name: "Upvote", pressed: true })
      .or(page.getByRole("button", { name: "Downvote", pressed: true })),
  ).toBeVisible();
});

When("l'utilisateur retire son vote", async ({ page }) => {
  const activeVote = page.getByRole("button", {
    name: /^(Upvote|Downvote)$/,
    pressed: true,
  });

  await expect(activeVote).toBeVisible();
  await activeVote.click();
});

Then("le vote de l'utilisateur est supprimé", async ({ page }) => {
  await expect(
    page.getByRole("button", {
      name: /^(Upvote|Downvote)$/,
      pressed: true,
    }),
  ).toHaveCount(0);
});
