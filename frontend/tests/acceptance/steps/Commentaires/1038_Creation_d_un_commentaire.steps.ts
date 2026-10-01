import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "un utilisateur authentifié consulte une œuvre qu'il a déposée",
  async ({}) => {
    // TODO: implement
  },
);

When("il rédige le commentaire {string}", async ({}, str: string) => {
  // TODO: implement
});

When("il valide la publication", async ({}) => {
  // TODO: implement
});

Then("le commentaire {string} est enregistré", async ({}, str: string) => {
  // TODO: implement
});

Then("il est affiché sous l'œuvre concernée avec son auteur", async ({}) => {
  // TODO: implement
});

Given(
  "un utilisateur authentifié consulte une œuvre qu'il n'a pas déposée",
  async ({}) => {
    // TODO: implement
  },
);

Given("un visiteur non authentifié consulte une œuvre", async ({}) => {
  // TODO: implement
});

When("il tente de publier le commentaire {string}", async ({}, str: string) => {
  // TODO: implement
});

Then("le système l'empêche de publier le commentaire", async ({}) => {
  // TODO: implement
});

Then("le commentaire n'est pas enregistré", async ({}) => {
  // TODO: implement
});

Then(
  "un message indique qu'il doit être connecté pour commenter",
  async ({}) => {
    // TODO: implement
  },
);
