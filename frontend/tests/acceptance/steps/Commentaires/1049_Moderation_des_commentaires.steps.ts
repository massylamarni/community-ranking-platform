import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("un administrateur est authentifié", async ({}) => {
  // TODO: implement
});

Given(
  "un commentaire publié ne respecte pas les règles définies par le site",
  async ({}) => {
    // TODO: implement
  },
);

When("un administrateur consulte ce commentaire", async ({}) => {
  // TODO: implement
});

When("il le supprime dans le cadre de la modération", async ({}) => {
  // TODO: implement
});

Then("le commentaire n{string}œuvre concernée", async ({}, str: string) => {
  // TODO: implement
});

When(
  "un utilisateur non administrateur tente de le supprimer au titre de la modération",
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
