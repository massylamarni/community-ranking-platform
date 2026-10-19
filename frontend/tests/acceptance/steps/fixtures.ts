import { test as base, createBdd } from 'playwright-bdd';

export type AcceptanceContext = Record<string, unknown>;

export const test = base.extend<{ ctx: AcceptanceContext }>({
  ctx: async ({}, provide) => {
    await provide({});
  },
});
export const { Given, When, Then } = createBdd(test);
