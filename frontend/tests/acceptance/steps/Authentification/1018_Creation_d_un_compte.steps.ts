import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("un visiteur est sur la page de création de compte", async ({}) => {
  // TODO: implement
});

When("il saisit le pseudo {string}", async ({}, str: string) => {
  // TODO: implement
});

When("il saisit l'adresse e-mail {string}", async ({}, str: string) => {
  // TODO: implement
});

When("il saisit le mot de passe {string}", async ({}, str: string) => {
  // TODO: implement
});

When("il valide le formulaire", async ({}) => {
  // TODO: implement
});

Then("le compte {string} est créé", async ({}, str: string) => {
  // TODO: implement
});

Then("un message de confirmation est affiché", async ({}) => {
  // TODO: implement
});

Then("l'utilisateur peut se connecter avec ses identifiants", async ({}) => {
  // TODO: implement
});

Then("le compte n'est pas créé", async ({}) => {
  // TODO: implement
});

Then("un message indique que le pseudo est obligatoire", async ({}) => {
  // TODO: implement
});

Then("un message indique que l'adresse e-mail est invalide", async ({}) => {
  // TODO: implement
});
