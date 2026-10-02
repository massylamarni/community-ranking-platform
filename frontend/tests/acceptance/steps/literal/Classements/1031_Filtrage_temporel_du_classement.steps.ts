import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "l'utilisateur consulte le classement avec la période {string} sélectionnée",
  async ({}, str: string) => {
    // TODO: implement
  },
);

When("il sélectionne la période {string}", async ({}, str: string) => {
  // TODO: implement
});

When("il valide ce choix", async ({}) => {
  // TODO: implement
});

Then(
  "le classement affiché est recalculé pour refléter uniquement les votes du mois en cours",
  async ({}) => {
    // TODO: implement
  },
);
