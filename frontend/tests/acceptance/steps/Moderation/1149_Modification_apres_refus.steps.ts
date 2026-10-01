import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("l{string}œuvre {string}", async ({}, str1: string, str2: string) => {
  // TODO: implement
});

Given("la proposition a été refusée", async ({}) => {
  // TODO: implement
});

When("utilisateur modifie la description de l'œuvre", async ({}) => {
  // TODO: implement
});

When("il remplace la description par {string}", async ({}, str: string) => {
  // TODO: implement
});

When("il soumet à nouveau l'œuvre", async ({}) => {
  // TODO: implement
});

Then("la nouvelle proposition est enregistrée", async ({}) => {
  // TODO: implement
});

Then("la proposition est envoyée au filtrage automatique", async ({}) => {
  // TODO: implement
});

Then("son statut est {string}", async ({}, str: string) => {
  // TODO: implement
});
