import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("un utilisateur authentifié", async ({}) => {
  // TODO: implement
});

Given("l'utilisateur a attribué un vote positif à une œuvre", async ({}) => {
  // TODO: implement
});

When("l'utilisateur consulte l'œuvre", async ({}) => {
  // TODO: implement
});

Then(
  "l'interface indique que le vote positif est actuellement sélectionné",
  async ({}) => {
    // TODO: implement
  },
);

Given("l'utilisateur a attribué un vote négatif à une œuvre", async ({}) => {
  // TODO: implement
});

Then(
  "l'interface indique que le vote négatif est actuellement sélectionné",
  async ({}) => {
    // TODO: implement
  },
);

Given("l'utilisateur n'a pas voté pour une œuvre", async ({}) => {
  // TODO: implement
});

Then("aucun vote n'est indiqué comme actuellement sélectionné", async ({}) => {
  // TODO: implement
});
