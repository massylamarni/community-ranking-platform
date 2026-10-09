import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "l'utilisateur {string} a publié {int} œuvres, {int} commentaire, et voté positivement pour {int} œuvres",
  async ({}, str: string, count1: number, count2: number, count3: number) => {
    // TODO: implement
  },
);

When("son profil public est consulté", async ({}) => {
  // TODO: implement
});

Then(
  "ses {int} œuvres publiées sont affichées sur son profil",
  async ({}, count: number) => {
    // TODO: implement
  },
);

Then("son commentaire est affiché sur son profil", async ({}) => {
  // TODO: implement
});

Then(
  "les {int} œuvres qu'elle a votées positivement sont affichées comme favoris sur son profil",
  async ({}, count: number) => {
    // TODO: implement
  },
);
