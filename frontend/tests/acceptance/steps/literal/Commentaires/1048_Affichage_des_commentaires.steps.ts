import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "l'œuvre {string} a reçu {int} commentaires publiés",
  async ({}, str: string, count: number) => {
    // TODO: implement
  },
);

When("cette œuvre est consultée", async ({}) => {
  // TODO: implement
});

Then(
  "les {int} commentaires sont affichés sous l'œuvre",
  async ({}, count: number) => {
    // TODO: implement
  },
);
