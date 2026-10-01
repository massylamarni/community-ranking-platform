import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("un utilisateur possède un compte actif", async ({}) => {
  // TODO: implement
});

When("un administrateur bloque son compte", async ({}) => {
  // TODO: implement
});

Then("l'utilisateur est informé que son compte a été bloqué", async ({}) => {
  // TODO: implement
});

When("un administrateur supprime son compte", async ({}) => {
  // TODO: implement
});

Then("l'utilisateur est informé que son compte a été supprimé", async ({}) => {
  // TODO: implement
});

Given("un utilisateur possède un contenu", async ({}) => {
  // TODO: implement
});

When(
  "un administrateur réalise une action affectant ce contenu",
  async ({}) => {
    // TODO: implement
  },
);

Then("l{string}action réalisée", async ({}, str: string) => {
  // TODO: implement
});
