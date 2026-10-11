import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "le classement hebdomadaire de la semaine précédente a été archivé avec le résultat {string}, {string}, {string}",
  async ({}, str1: string, str2: string, str3: string) => {
    // TODO: implement
  },
);

When(
  "l'utilisateur accède à la section des classements précédents",
  async ({}) => {
    // TODO: implement
  },
);

When("il sélectionne la semaine précédente", async ({}) => {
  // TODO: implement
});

Then(
  "le classement affiché est exactement {string}, {string}, {string}",
  async ({}, str1: string, str2: string, str3: string) => {
    // TODO: implement
  },
);
