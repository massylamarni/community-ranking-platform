// Feature: Classement hebdomadaire
import { Given, Then } from "../fixtures";
import {
  assertRankingRow,
  assertWorkNotInRanking,
  getOrCreateRankingWorks,
  setupRankingsMock,
} from "../../utils/rankings";

Given(
  "l'œuvre {string} a reçu un vote positif au cours de la semaine en cours",
  async ({ page, ctx }, title: string) => {
    const list = getOrCreateRankingWorks(ctx);
    list.push({ title, category: "Photographie", score: 1 });
    await setupRankingsMock(page, () => list);
  },
);

Given(
  "l'œuvre {string} a reçu un vote positif la semaine précédente",
  async () => {
    // The vote is outside the current week's ranking period.
  },
);

Then(
  "le vote de {string} est comptabilisé dans ce classement",
  async ({ page }, title: string) => {
    await assertRankingRow(page, title, undefined, 1);
  },
);

Then(
  "le vote de {string} datant de la semaine précédente n'est pas comptabilisé dans ce classement",
  async ({ page }, title: string) => {
    await assertWorkNotInRanking(page, title);
  },
);
