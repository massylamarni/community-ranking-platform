import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("l'utilisateur {string} est authentifié", async ({}, str: string) => {
  // TODO: implement
});

Given("son profil contient le pseudo {string}", async ({}, str: string) => {
  // TODO: implement
});

Given(
  "son profil contient l'adresse e-mail {string}",
  async ({}, str: string) => {
    // TODO: implement
  },
);

When("elle consulte son profil", async ({}) => {
  // TODO: implement
});

Then("son pseudo {string} est affiché", async ({}, str: string) => {
  // TODO: implement
});

When("elle modifie une information autorisée de son profil", async ({}) => {
  // TODO: implement
});

When("elle valide les modifications", async ({}) => {
  // TODO: implement
});

Then("la nouvelle information est enregistrée", async ({}) => {
  // TODO: implement
});

Then("la nouvelle information est affichée dans son profil", async ({}) => {
  // TODO: implement
});
