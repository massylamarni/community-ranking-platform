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

When("il associe l'image {string} à l'œuvre", async ({}, str: string) => {
  // TODO: implement
});

When("il valide la création", async ({}) => {
  // TODO: implement
});

Then("l'œuvre est créée", async ({}) => {
  // TODO: implement
});

Then("l'image {string} est associée à l'œuvre", async ({}, str: string) => {
  // TODO: implement
});

When("il ne sélectionne aucune image", async ({}) => {
  // TODO: implement
});

Then("aucune image n'est associée à l'œuvre", async ({}) => {
  // TODO: implement
});
