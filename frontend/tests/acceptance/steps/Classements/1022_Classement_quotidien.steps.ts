import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "l'œuvre {string} a reçu un vote positif aujourd'hui",
  async ({}, str: string) => {
    // TODO: implement
  },
);

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
  "le vote d'aujourd'hui sur {string} est comptabilisé dans ce classement",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then(
  "le vote d'hier sur {string} n'est pas comptabilisé dans ce classement",
  async ({}, str: string) => {
    // TODO: implement
  },
);
