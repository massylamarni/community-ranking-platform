// Feature: Classement mensuel
import { Given, Then } from "../fixtures";
import {
  assertWorkNotInRanking,
  getOrCreateRankingWorks,
  setupRankingsMock,
} from "../../utils/rankings";

Given(
  "l'œuvre {string} a reçu un vote positif au cours du mois en cours",
  async ({ page, ctx }, title: string) => {
    const list = getOrCreateRankingWorks(ctx);
    list.push({ title, category: "Photographie", score: 1 });
    await setupRankingsMock(page, () => list);
  },
);

Given("l'œuvre {string} a reçu un vote positif le mois précédent", async () => {
  // The vote is outside the current month's ranking period.
});

Then(
  "le vote de {string} datant du mois précédent n'est pas comptabilisé dans ce classement",
  async ({ page }, title: string) => {
    await assertWorkNotInRanking(page, title);
  },
);
