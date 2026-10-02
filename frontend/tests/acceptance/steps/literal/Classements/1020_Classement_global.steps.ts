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
  "l'œuvre {string} apparaît en position {int} avec un score de {int}",
  async ({}, str: string, position: number, score: number) => {
    // TODO: implement
  },
);
