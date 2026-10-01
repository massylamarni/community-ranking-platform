import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "l'œuvre {string} a reçu un vote positif au cours du mois en cours",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Given(
  "l'œuvre {string} a reçu un vote positif le mois précédent",
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
  "le vote de {string} est comptabilisé dans ce classement",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then(
  "le vote de {string} datant du mois précédent n'est pas comptabilisé dans ce classement",
  async ({}, str: string) => {
    // TODO: implement
  },
);
