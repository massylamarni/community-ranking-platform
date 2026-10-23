// Feature: Affichage du nombre total de votes
import { findVotedWork, save } from "../common/shared.steps";
import { Given, Then } from "../fixtures";
import { expect } from "@playwright/test";

Given("l'œuvre possède des votes", async ({ page, ctx }) => {
  const work = await findVotedWork(page);
  save(ctx, "workId", work?.id);
});

Then("le nombre total de votes de l'œuvre est affiché", async ({ page }) => {
  const readCount = async (name: RegExp) => {
    const label = await page.getByRole("button", { name }).innerText();
    return Number(label.match(/\d+/)?.[0] ?? 0);
  };
  const total = (await readCount(/Upvote/)) + (await readCount(/Downvote/));
  expect(total).toBeGreaterThan(0);
});
