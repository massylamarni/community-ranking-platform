import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("un utilisateur authentifié", async ({}) => {
  // TODO: implement
});

Given("une œuvre créée par cet utilisateur", async ({}) => {
  // TODO: implement
});

When(
  "l{string}attribuer un vote positif à son œuvre",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then("le vote est refusé", async ({}) => {
  // TODO: implement
});

When(
  "l{string}attribuer un vote négatif à son œuvre",
  async ({}, str: string) => {
    // TODO: implement
  },
);
