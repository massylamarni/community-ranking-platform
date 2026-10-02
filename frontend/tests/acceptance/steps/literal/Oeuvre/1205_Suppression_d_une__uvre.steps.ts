import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("un utilisateur authentifié", async ({}) => {
  // TODO: implement
});

Given("une œuvre créée par cet utilisateur", async ({}) => {
  // TODO: implement
});

When("l'utilisateur supprime l'œuvre", async ({}) => {
  // TODO: implement
});

Then("l'œuvre est supprimée", async ({}) => {
  // TODO: implement
});

Given("un administrateur authentifié", async ({}) => {
  // TODO: implement
});

Given("une œuvre existante", async ({}) => {
  // TODO: implement
});

Given("une œuvre créée par un autre utilisateur", async ({}) => {
  // TODO: implement
});

When("l'administrateur supprime l'œuvre", async ({}) => {
  // TODO: implement
});

When("l'utilisateur tente de supprimer l'œuvre", async ({}) => {
  // TODO: implement
});

Then("la suppression est refusée", async ({}) => {
  // TODO: implement
});
