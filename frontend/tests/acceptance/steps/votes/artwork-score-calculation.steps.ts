// Feature: Calcul du score d'une œuvre
import { expect } from "@playwright/test";
import { Given, When, Then } from "../fixtures";

type ArtworkVoteCounts = {
  positives: number;
  negatives: number;
  score?: number;
};

function getVoteCounts(ctx: Record<string, unknown>): ArtworkVoteCounts {
  const current = ctx.artworkVoteCounts;
  if (typeof current === "object" && current !== null) {
    return current as ArtworkVoteCounts;
  }
  const counts: ArtworkVoteCounts = { positives: 0, negatives: 0 };
  ctx.artworkVoteCounts = counts;
  return counts;
}

Given(
  "une œuvre possède {int} votes positifs",
  async ({ ctx }, votes: number) => {
    getVoteCounts(ctx).positives = votes;
  },
);

Given(
  "l'œuvre possède {int} votes négatifs",
  async ({ ctx }, votes: number) => {
    getVoteCounts(ctx).negatives = votes;
  },
);

When("le score de l'œuvre est calculé", async ({ ctx }) => {
  const counts = getVoteCounts(ctx);
  counts.score = counts.positives - counts.negatives;
});

Then("le score de l'œuvre est égal à {int}", async ({ ctx }, score: number) => {
  await expect(getVoteCounts(ctx).score).toBe(score);
});
