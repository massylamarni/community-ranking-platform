import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("l'utilisateur {string} est authentifié", async ({}, str: string) => {
  // TODO: implement
});

Given("la catégorie {string} existe", async ({}, str: string) => {
  // TODO: implement
});

When("elle saisit le titre {string}", async ({}, str: string) => {
  // TODO: implement
});

When("elle saisit la description {string}", async ({}, str: string) => {
  // TODO: implement
});

When("elle sélectionne la catégorie {string}", async ({}, str: string) => {
  // TODO: implement
});

When("elle valide la création", async ({}) => {
  // TODO: implement
});

Then("l'œuvre {string} est créée", async ({}, str: string) => {
  // TODO: implement
});

Then(
  "l'œuvre est associée à l'utilisateur {string}",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Given("un visiteur n'est pas authentifié", async ({}) => {
  // TODO: implement
});

When("il tente de créer une œuvre", async ({}) => {
  // TODO: implement
});

Then("l'œuvre n'est pas créée", async ({}) => {
  // TODO: implement
});

Then("il est invité à se connecter", async ({}) => {
  // TODO: implement
});
