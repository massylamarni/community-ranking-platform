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

Then("le commentaire n'est plus affiché sous l'œuvre concernée", async ({}) => {
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

Then("un message indique qu'il n'a pas les droits nécessaires", async ({}) => {
  // TODO: implement
});
