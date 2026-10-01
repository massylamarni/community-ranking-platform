import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("l'utilisateur {string} est authentifié", async ({}, str: string) => {
  // TODO: implement
});

When("il demande à se déconnecter", async ({}) => {
  // TODO: implement
});

Then("l{string}est plus authentifié", async ({}, str: string) => {
  // TODO: implement
});

Then("il est redirigé vers une page accessible aux visiteurs", async ({}) => {
  // TODO: implement
});

When("il se déconnecte", async ({}) => {
  // TODO: implement
});

When("il tente d'accéder à son espace utilisateur", async ({}) => {
  // TODO: implement
});

Then("l'accès lui est refusé", async ({}) => {
  // TODO: implement
});

Then("il est invité à se connecter", async ({}) => {
  // TODO: implement
});
