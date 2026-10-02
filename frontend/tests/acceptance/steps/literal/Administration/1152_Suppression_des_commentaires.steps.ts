import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("l'administrateur est connecté", async ({}) => {
  // TODO: implement
});

Given(
  "{string} a publié le commentaire {string} sur {string}",
  async ({}, str1: string, str2: string, str3: string) => {
    // TODO: implement
  },
);

When("l'administrateur supprime le commentaire", async ({}) => {
  // TODO: implement
});

Then(
  "le commentaire n'est plus visible sur {string}",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then(
  "le commentaire n'est plus visible sur le profil de {string}",
  async ({}, str: string) => {
    // TODO: implement
  },
);
