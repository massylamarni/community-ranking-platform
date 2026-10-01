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

When("l'administrateur accepte l'œuvre", async ({}) => {
  // TODO: implement
});

When("l'administrateur refuse l'œuvre", async ({}) => {
  // TODO: implement
});

Then("l'œuvre est publiée", async ({}) => {
  // TODO: implement
});

Then("son statut est {string}", async ({}, str: string) => {
  // TODO: implement
});

Then("l'œuvre n'est pas publiée", async ({}) => {
  // TODO: implement
});
