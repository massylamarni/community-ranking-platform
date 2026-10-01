import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "les œuvres publiées suivantes existent dans des catégories différentes :",
  async ({}) => {
    // TODO: implement
  },
);

When("l'utilisateur consulte le classement global", async ({}) => {
  // TODO: implement
});

Then(
  "l'œuvre {string} apparaît en position {string} avec un score de {string}",
  async ({}, str: string, position: string, score: string) => {
    // TODO: implement
  },
);
