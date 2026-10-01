import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("un utilisateur authentifié", async ({}) => {
  // TODO: implement
});

Given("une œuvre créée par cet utilisateur", async ({}) => {
  // TODO: implement
});

When("l'utilisateur modifie l'œuvre", async ({}) => {
  // TODO: implement
});

Then("les modifications sont enregistrées", async ({}) => {
  // TODO: implement
});

Given("une œuvre créée par un autre utilisateur", async ({}) => {
  // TODO: implement
});

When("l'utilisateur tente de modifier l'œuvre", async ({}) => {
  // TODO: implement
});

Then("la modification est refusée", async ({}) => {
  // TODO: implement
});
