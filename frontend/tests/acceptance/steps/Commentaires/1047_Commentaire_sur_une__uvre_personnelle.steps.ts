import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given(
  "un utilisateur authentifié consulte une œuvre qu'il a lui-même déposée",
  async ({}) => {
    // TODO: implement
  },
);

When(
  "il tente de publier un commentaire principal sur cette œuvre",
  async ({}) => {
    // TODO: implement
  },
);

Then("l'action est refusée par le système", async ({}) => {
  // TODO: implement
});

Then(
  "un message indique qu'il ne peut pas commenter sa propre œuvre",
  async ({}) => {
    // TODO: implement
  },
);

Given(
  "un autre utilisateur a publié un commentaire sur une œuvre appartenant à l'utilisateur authentifié",
  async ({}) => {
    // TODO: implement
  },
);

When("l{string}œuvre répond à ce commentaire", async ({}, str: string) => {
  // TODO: implement
});

Then("la réponse est enregistrée", async ({}) => {
  // TODO: implement
});

Then("elle est affichée sous l'œuvre concernée", async ({}) => {
  // TODO: implement
});
