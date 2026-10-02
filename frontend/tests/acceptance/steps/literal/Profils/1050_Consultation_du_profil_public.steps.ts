import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "l'utilisateur {string} possède un profil public",
  async ({}, str: string) => {
    // TODO: implement
  },
);

When("un autre utilisateur consulte ce profil", async ({}) => {
  // TODO: implement
});

Then("le profil de {string} s'affiche avec succès", async ({}, str: string) => {
  // TODO: implement
});
