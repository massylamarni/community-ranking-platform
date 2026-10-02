import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "l'utilisateur {string} publie un commentaire sous une œuvre",
  async ({}, str: string) => {
    // TODO: implement
  },
);

When("l'œuvre est consultée", async ({}) => {
  // TODO: implement
});

Then(
  "le commentaire affiché indique {string} comme auteur",
  async ({}, str: string) => {
    // TODO: implement
  },
);
