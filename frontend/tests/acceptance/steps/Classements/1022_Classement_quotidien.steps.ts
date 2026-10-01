import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("l{string}hui", async ({}, str: string) => {
  // TODO: implement
});

Given(
  "l'œuvre {string} a reçu un vote positif hier, hors de la période du jour en cours",
  async ({}, str: string) => {
    // TODO: implement
  },
);

When(
  "l'utilisateur consulte le classement {string}",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then(
  "le vote d{string}hui sur {string} est comptabilisé dans ce classement",
  async ({}, str1: string, str2: string) => {
    // TODO: implement
  },
);

Then(
  "le vote d{string}est pas comptabilisé dans ce classement",
  async ({}, str: string) => {
    // TODO: implement
  },
);
