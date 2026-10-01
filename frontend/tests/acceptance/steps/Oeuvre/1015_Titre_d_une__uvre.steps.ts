import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("l'utilisateur {string} est authentifié", async ({}, str: string) => {
  // TODO: implement
});

When("elle saisit le titre {string}", async ({}, str: string) => {
  // TODO: implement
});

When("elle renseigne les autres informations obligatoires", async ({}) => {
  // TODO: implement
});

When("elle valide la création", async ({}) => {
  // TODO: implement
});

Then("l'œuvre est créée avec le titre {string}", async ({}, str: string) => {
  // TODO: implement
});

When("elle ne saisit aucun titre", async ({}) => {
  // TODO: implement
});

Then("l{string}est pas créée", async ({}, str: string) => {
  // TODO: implement
});

Then("un message indique que le titre est obligatoire", async ({}) => {
  // TODO: implement
});
