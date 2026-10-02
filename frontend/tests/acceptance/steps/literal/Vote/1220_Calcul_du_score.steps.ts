import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "une œuvre possède {int} votes positifs",
  async ({}, votesPositifs: number) => {
    // TODO: implement
  },
);

Given(
  "l'œuvre possède {int} votes négatifs",
  async ({}, votesNegatifs: number) => {
    // TODO: implement
  },
);

When("le score de l'œuvre est calculé", async ({}) => {
  // TODO: implement
});

Then("le score de l'œuvre est égal à {int}", async ({}, score: number) => {
  // TODO: implement
});
