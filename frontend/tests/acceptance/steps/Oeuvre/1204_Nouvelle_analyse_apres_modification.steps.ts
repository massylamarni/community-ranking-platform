import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("une œuvre existante", async ({}) => {
  // TODO: implement
});

Given("l{string}œuvre", async ({}, str: string) => {
  // TODO: implement
});

When("les modifications sont enregistrées", async ({}) => {
  // TODO: implement
});

Then(
  "l'œuvre modifiée est soumise à nouveau au processus de filtrage",
  async ({}) => {
    // TODO: implement
  },
);
