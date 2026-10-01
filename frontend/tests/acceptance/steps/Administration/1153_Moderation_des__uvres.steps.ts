import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("l'administrateur est connecté", async ({}) => {
  // TODO: implement
});

Given(
  "l'œuvre {string} est en attente de modération",
  async ({}, str: string) => {
    // TODO: implement
  },
);

When("l{string}œuvre", async ({}, str: string) => {
  // TODO: implement
});

Then("l'œuvre est publiée", async ({}) => {
  // TODO: implement
});

Then("son statut est {string}", async ({}, str: string) => {
  // TODO: implement
});

Then("l{string}est pas publiée", async ({}, str: string) => {
  // TODO: implement
});
