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
  "l{string}utilisateur {string}",
  async ({}, str1: string, str2: string) => {
    // TODO: implement
  },
);

Given("un visiteur n'est pas authentifié", async ({}) => {
  // TODO: implement
});

When("il tente de créer une œuvre", async ({}) => {
  // TODO: implement
});

Then("l{string}est pas créée", async ({}, str: string) => {
  // TODO: implement
});

Then("il est invité à se connecter", async ({}) => {
  // TODO: implement
});
