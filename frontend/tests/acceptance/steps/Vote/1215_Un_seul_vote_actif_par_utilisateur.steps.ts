import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("un utilisateur authentifié", async ({}) => {
  // TODO: implement
});

Given("une œuvre qui n{string}utilisateur", async ({}, str: string) => {
  // TODO: implement
});

Given(
  "l'utilisateur possède déjà un vote actif sur cette œuvre",
  async ({}) => {
    // TODO: implement
  },
);

When(
  "l{string}attribuer un nouveau vote à cette œuvre",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then("le système ne crée pas un second vote actif", async ({}) => {
  // TODO: implement
});

Then(
  "un seul vote reste actif pour cet utilisateur sur cette œuvre",
  async ({}) => {
    // TODO: implement
  },
);
