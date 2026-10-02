import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("un utilisateur authentifié", async ({}) => {
  // TODO: implement
});

Given("une catégorie existante", async ({}) => {
  // TODO: implement
});

When("l'utilisateur propose une œuvre dans cette catégorie", async ({}) => {
  // TODO: implement
});

Then("la proposition de l'œuvre est enregistrée", async ({}) => {
  // TODO: implement
});

Then("l'œuvre est associée à la catégorie sélectionnée", async ({}) => {
  // TODO: implement
});

Given("un utilisateur non authentifié", async ({}) => {
  // TODO: implement
});

When("l'utilisateur tente de proposer une œuvre", async ({}) => {
  // TODO: implement
});

Then("la proposition de l'œuvre est refusée", async ({}) => {
  // TODO: implement
});
