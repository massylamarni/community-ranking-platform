import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("un administrateur est authentifié", async ({}) => {
  // TODO: implement
});

Given("la catégorie {string} existe", async ({}, str: string) => {
  // TODO: implement
});

Given("aucune œuvre n'est associée à cette catégorie", async ({}) => {
  // TODO: implement
});

When(
  "l'administrateur supprime la catégorie {string}",
  async ({}, str: string) => {
    // TODO: implement
  },
);

When("il confirme la suppression", async ({}) => {
  // TODO: implement
});

Then("la catégorie {string} n'existe plus", async ({}, str: string) => {
  // TODO: implement
});

Then("elle n'apparaît plus dans la liste des catégories", async ({}) => {
  // TODO: implement
});

Given("un utilisateur non administrateur est authentifié", async ({}) => {
  // TODO: implement
});

When("il tente de supprimer la catégorie", async ({}) => {
  // TODO: implement
});

Then("la catégorie n'est pas supprimée", async ({}) => {
  // TODO: implement
});

Then("un message indique qu'il n'a pas les droits nécessaires", async ({}) => {
  // TODO: implement
});
