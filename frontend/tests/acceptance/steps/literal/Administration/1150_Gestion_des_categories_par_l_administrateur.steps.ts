import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("l'administrateur est connecté", async ({}) => {
  // TODO: implement
});

Given("la catégorie {string} n'existe pas", async ({}, str: string) => {
  // TODO: implement
});

When("l'administrateur crée la catégorie {string}", async ({}, str: string) => {
  // TODO: implement
});

Then("la catégorie {string} est créée", async ({}, str: string) => {
  // TODO: implement
});

Then("elle peut être utilisée pour déposer une œuvre", async ({}) => {
  // TODO: implement
});

Given("la catégorie {string} existe", async ({}, str: string) => {
  // TODO: implement
});

When("l'administrateur supprime la catégorie", async ({}) => {
  // TODO: implement
});

Then("la catégorie {string} n'existe plus", async ({}, str: string) => {
  // TODO: implement
});

Then(
  "elle ne peut plus être sélectionnée pour une nouvelle œuvre",
  async ({}) => {
    // TODO: implement
  },
);
