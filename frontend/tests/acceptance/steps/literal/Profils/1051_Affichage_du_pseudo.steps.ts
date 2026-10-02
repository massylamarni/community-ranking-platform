import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "l'utilisateur {string} possède un profil public",
  async ({}, str: string) => {
    // TODO: implement
  },
);

When("ce profil est consulté", async ({}) => {
  // TODO: implement
});

Then("le pseudo {string} est affiché sur la page", async ({}, str: string) => {
  // TODO: implement
});
