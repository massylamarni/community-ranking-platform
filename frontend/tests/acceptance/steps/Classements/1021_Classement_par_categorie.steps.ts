import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("les œuvres publiées suivantes existent :", async ({}) => {
  // TODO: implement
});

When(
  "l'utilisateur consulte le classement de la catégorie {string}",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then(
  "l'œuvre {string} apparaît en position {string} avec un score de {string}",
  async ({}, str: string, position: string, score: string) => {
    // TODO: implement
  },
);

Then("l{string}apparaît pas dans ce classement", async ({}, str: string) => {
  // TODO: implement
});
