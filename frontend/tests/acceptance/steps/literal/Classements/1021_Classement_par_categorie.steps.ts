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
  "l'œuvre {string} apparaît en position {int} avec un score de {int}",
  async ({}, str: string, position: number, score: number) => {
    // TODO: implement
  },
);

Then(
  "l'œuvre {string} n'apparaît pas dans ce classement",
  async ({}, str: string) => {
    // TODO: implement
  },
);
