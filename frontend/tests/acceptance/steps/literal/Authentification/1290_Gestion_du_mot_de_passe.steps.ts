import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("l'utilisateur {string} est authentifié", async ({}, str: string) => {
  // TODO: implement
});

When(
  "il saisit {string} comme ancien mot de passe",
  async ({}, str: string) => {
    // TODO: implement
  },
);

When(
  "il saisit {string} comme nouveau mot de passe",
  async ({}, str: string) => {
    // TODO: implement
  },
);

When("il confirme {string}", async ({}, str: string) => {
  // TODO: implement
});

When("il valide le formulaire", async ({}) => {
  // TODO: implement
});

Then("le mot de passe est modifié", async ({}) => {
  // TODO: implement
});

Then("il peut se connecter avec {string}", async ({}, str: string) => {
  // TODO: implement
});

Given(
  "un compte existe avec l'adresse e-mail {string}",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Given("l'utilisateur demande à réinitialiser son mot de passe", async ({}) => {
  // TODO: implement
});

When("il saisit {string}", async ({}, str: string) => {
  // TODO: implement
});

When("il valide la demande", async ({}) => {
  // TODO: implement
});

Then(
  "une procédure de réinitialisation est envoyée à cette adresse e-mail",
  async ({}) => {
    // TODO: implement
  },
);
