import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("l'utilisateur {string} est authentifié", async ({}, str: string) => {
  // TODO: implement
});

Given("la catégorie {string} existe", async ({}, str: string) => {
  // TODO: implement
});

When("elle crée l'œuvre {string}", async ({}, str: string) => {
  // TODO: implement
});

When("elle renseigne {string} comme catégorie", async ({}, str: string) => {
  // TODO: implement
});

When("elle publie l'œuvre", async ({}) => {
  // TODO: implement
});

Then("l'œuvre {string} est publiée", async ({}, str: string) => {
  // TODO: implement
});

Then(
  "l'œuvre {string} appartient à la catégorie {string}",
  async ({}, str1: string, str2: string) => {
    // TODO: implement
  },
);

When("elle ne sélectionne aucune catégorie", async ({}) => {
  // TODO: implement
});

When("elle tente de publier l'œuvre", async ({}) => {
  // TODO: implement
});

Then("l'œuvre n'est pas publiée", async ({}) => {
  // TODO: implement
});

Then("un message indique qu'une catégorie est obligatoire", async ({}) => {
  // TODO: implement
});
