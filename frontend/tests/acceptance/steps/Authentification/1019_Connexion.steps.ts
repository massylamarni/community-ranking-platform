import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "un compte existe avec le pseudo {string} et le mot de passe {string}",
  async ({}, str1: string, str2: string) => {
    // TODO: implement
  },
);

Given("l'utilisateur est sur la page de connexion", async ({}) => {
  // TODO: implement
});

When("il saisit {string} comme identifiant", async ({}, str: string) => {
  // TODO: implement
});

When("il saisit {string} comme mot de passe", async ({}, str: string) => {
  // TODO: implement
});

When("il valide le formulaire", async ({}) => {
  // TODO: implement
});

Then("l'utilisateur est authentifié", async ({}) => {
  // TODO: implement
});

Then("il est redirigé vers son espace utilisateur", async ({}) => {
  // TODO: implement
});

When(
  "l'utilisateur saisit {string} comme identifiant",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then("l{string}est pas authentifié", async ({}, str: string) => {
  // TODO: implement
});

Then("un message indique que les identifiants sont incorrects", async ({}) => {
  // TODO: implement
});
