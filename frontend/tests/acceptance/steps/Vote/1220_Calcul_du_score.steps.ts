import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "une œuvre possède {string} votes positifs",
  async ({}, votesPositifs: string) => {
    // TODO: implement
  },
);

Given(
  "l'œuvre possède {string} votes négatifs",
  async ({}, votesNegatifs: string) => {
    // TODO: implement
  },
);

When("le score de l'œuvre est calculé", async ({}) => {
  // TODO: implement
});

Then("le score de l'œuvre est égal à {string}", async ({}, score: string) => {
  // TODO: implement
});
