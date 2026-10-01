import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("un utilisateur authentifié a publié un commentaire", async ({}) => {
  // TODO: implement
});

When("il supprime ce commentaire", async ({}) => {
  // TODO: implement
});

Then("le commentaire n{string}œuvre", async ({}, str: string) => {
  // TODO: implement
});

Given("un administrateur est authentifié", async ({}) => {
  // TODO: implement
});

Given("un commentaire est publié sous une œuvre", async ({}) => {
  // TODO: implement
});

When("un administrateur supprime ce commentaire", async ({}) => {
  // TODO: implement
});

When(
  "un autre utilisateur authentifié, ni auteur ni administrateur, tente de supprimer ce commentaire",
  async ({}) => {
    // TODO: implement
  },
);

Then("la suppression est refusée", async ({}) => {
  // TODO: implement
});

Then(
  "un message indique qu{string}a pas les droits nécessaires",
  async ({}, str: string) => {
    // TODO: implement
  },
);
