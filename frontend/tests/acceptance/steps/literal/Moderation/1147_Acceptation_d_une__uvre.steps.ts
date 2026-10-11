import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "l'œuvre {string} est en attente de modération",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Given("l'œuvre appartient à la catégorie {string}", async ({}, str: string) => {
  // TODO: implement
});

Given("l'administrateur est connecté", async ({}) => {
  // TODO: implement
});

When("l'administrateur accepte l'œuvre", async ({}) => {
  // TODO: implement
});

Then(
  "le statut de {string} devient {string}",
  async ({}, str1: string, str2: string) => {
    // TODO: implement
  },
);

Then(
  "{string} apparaît dans la liste des œuvres de la catégorie {string}",
  async ({}, str1: string, str2: string) => {
    // TODO: implement
  },
);

Then("l'œuvre peut être consultée par les utilisateurs", async ({}) => {
  // TODO: implement
});
