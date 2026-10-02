import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "un utilisateur authentifié a publié le commentaire {string}",
  async ({}, str: string) => {
    // TODO: implement
  },
);

When("il modifie ce commentaire en {string}", async ({}, str: string) => {
  // TODO: implement
});

When("il valide la modification", async ({}) => {
  // TODO: implement
});

Then(
  "le commentaire affiché sous l'œuvre est {string}",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Given("un utilisateur authentifié a publié un commentaire", async ({}) => {
  // TODO: implement
});

When(
  "un autre utilisateur authentifié tente de modifier ce commentaire",
  async ({}) => {
    // TODO: implement
  },
);

Then("la modification est refusée", async ({}) => {
  // TODO: implement
});

Then("un message indique qu'il n'a pas les droits nécessaires", async ({}) => {
  // TODO: implement
});
