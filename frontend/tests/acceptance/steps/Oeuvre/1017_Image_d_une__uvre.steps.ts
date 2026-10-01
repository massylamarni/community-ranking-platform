import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("l'utilisateur {string} est authentifié", async ({}, str: string) => {
  // TODO: implement
});

Given(
  "les informations obligatoires de l'œuvre sont renseignées",
  async ({}) => {
    // TODO: implement
  },
);

When("il associe l{string}œuvre", async ({}, str: string) => {
  // TODO: implement
});

When("il valide la création", async ({}) => {
  // TODO: implement
});

Then("l'œuvre est créée", async ({}) => {
  // TODO: implement
});

Then("l{string}œuvre", async ({}, str: string) => {
  // TODO: implement
});

When("il ne sélectionne aucune image", async ({}) => {
  // TODO: implement
});

Then("aucune image n{string}œuvre", async ({}, str: string) => {
  // TODO: implement
});
