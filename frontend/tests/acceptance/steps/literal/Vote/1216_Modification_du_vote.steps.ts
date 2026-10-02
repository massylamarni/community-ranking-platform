import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("un utilisateur authentifié", async ({}) => {
  // TODO: implement
});

Given("l'utilisateur a attribué un vote positif à une œuvre", async ({}) => {
  // TODO: implement
});

When("l'utilisateur modifie son vote en vote négatif", async ({}) => {
  // TODO: implement
});

Then("le vote de l'utilisateur devient négatif", async ({}) => {
  // TODO: implement
});

Given("l'utilisateur a attribué un vote négatif à une œuvre", async ({}) => {
  // TODO: implement
});

When("l'utilisateur modifie son vote en vote positif", async ({}) => {
  // TODO: implement
});

Then("le vote de l'utilisateur devient positif", async ({}) => {
  // TODO: implement
});
