import { test as base, createBdd } from "playwright-bdd";

type Fixtures = {
  ctx: Record<string, unknown>;
};

export const test = base.extend<Fixtures>({
  ctx: async ({}, use) => {
    const ctx: Record<string, unknown> = {};

    // eslint-disable-next-line
    await use(ctx);
  },
});

export const { Given, When, Then } = createBdd(test);
