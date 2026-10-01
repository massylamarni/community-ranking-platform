import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "l'utilisateur consulte le classement d'une catégorie où l'œuvre {string} affiche un score de {int}",
  async ({}, str: string, count: number) => {
    // TODO: implement
  },
);

When(
  "un autre utilisateur attribue un vote positif à l'œuvre {string}",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then(
  "le score de {string} affiché passe à {int}",
  async ({}, str: string, count: number) => {
    // TODO: implement
  },
);

Then(
  "cette mise à jour s'affiche sans que l'utilisateur ait besoin de recharger la page",
  async ({}) => {
    // TODO: implement
  },
);
