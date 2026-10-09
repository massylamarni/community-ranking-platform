import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "l'œuvre {string} est en attente de modération",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Given("l'administrateur est connecté", async ({}) => {
  // TODO: implement
});

When("l'administrateur refuse l'œuvre", async ({}) => {
  // TODO: implement
});

Then(
  "le statut de {string} devient {string}",
  async ({}, str1: string, str2: string) => {
    // TODO: implement
  },
);

Then(
  "{string} n'apparaît pas dans les œuvres publiques",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then("l'auteur de {string} est informé du refus", async ({}, str: string) => {
  // TODO: implement
});
