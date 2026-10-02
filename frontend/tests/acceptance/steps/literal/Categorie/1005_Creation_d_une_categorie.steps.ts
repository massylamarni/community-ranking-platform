import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("un administrateur est authentifié", async ({}) => {
  // TODO: implement
});

When("il saisit le nom de catégorie {string}", async ({}, str: string) => {
  // TODO: implement
});

When("il valide la création", async ({}) => {
  // TODO: implement
});

Then("la catégorie {string} est créée", async ({}, str: string) => {
  // TODO: implement
});

Then("elle apparaît dans la liste des catégories", async ({}) => {
  // TODO: implement
});

Given("un utilisateur non administrateur est authentifié", async ({}) => {
  // TODO: implement
});

When("il tente de créer la catégorie {string}", async ({}, str: string) => {
  // TODO: implement
});

Then("la catégorie n'est pas créée", async ({}) => {
  // TODO: implement
});

Then("un message indique qu'il n'a pas les droits nécessaires", async ({}) => {
  // TODO: implement
});
