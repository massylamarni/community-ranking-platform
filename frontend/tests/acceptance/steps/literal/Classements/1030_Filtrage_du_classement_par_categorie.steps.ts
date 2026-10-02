import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "l'utilisateur consulte le classement global comportant des œuvres de plusieurs catégories",
  async ({}) => {
    // TODO: implement
  },
);

When("il sélectionne le filtre {string}", async ({}, str: string) => {
  // TODO: implement
});

When("il valide le filtre", async ({}) => {
  // TODO: implement
});

Then(
  "seules les œuvres de la catégorie {string} restent affichées",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then("elles restent triées par score", async ({}) => {
  // TODO: implement
});
