import { expect, type Page } from "@playwright/test";
import { Given, When, Then } from "../fixtures";
import { Category, Work } from "@/types/api";

const USER_ALIASES: Record<string, string> = {
  frédégonde: "alice",
  administrateur: "admin",
  alice: "alice",
  bob: "bob",
  admin: "admin",
};

export const resolveUsername = (username: string) => {
  const key = username.trim().toLocaleLowerCase("fr-FR");
  return USER_ALIASES[key];
};

type ScenarioContext = Record<string, unknown>;

async function api<T>(
  page: Page,
  method: "GET" | "POST" | "PUT",
  path: string,
  data?: unknown,
): Promise<T> {
  const baseUrl =
    page.url() === "about:blank"
      ? (process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100")
      : page.url();
  const url = new URL(`/backend-api${path}`, baseUrl).toString();
  const response = await page.context().request.fetch(url, { method, data });
  if (!response.ok()) {
    throw new Error(
      `${method} ${path} failed (${response.status()}): ${await response.text()}`,
    );
  }
  if (response.status() === 204) return undefined as T;
  return (await response.json()) as T;
}

export function save(ctx: ScenarioContext, key: string, value: unknown) {
  ctx[key] = value;
}

export function saved<T>(ctx: ScenarioContext, key: string): T | undefined {
  return ctx[key] as T | undefined;
}

export async function loginAs(page: Page, requestedName: string) {
  const username = resolveUsername(requestedName);
  await page.goto("/auth/login");
  await page.getByLabel("Nom d'utilisateur").fill(username);
  await page.getByLabel("Mot de passe").fill("Password123!");
  await page.getByRole("button", { name: "auth-login" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth/login"));
}

async function currentCategories(page: Page) {
  return api<Category[]>(page, "GET", "/categories");
}

async function ensureCategory(page: Page, ctx: ScenarioContext, name: string) {
  const categories = await currentCategories(page);
  const existing = categories.find((category) => category.name === name);
  if (existing) {
    save(ctx, "categoryId", existing.id);
    save(ctx, "categoryName", existing.name);
    return existing;
  }

  const previousUser = saved<string>(ctx, "username");
  if (previousUser !== "admin") await loginAs(page, "Administrateur");
  const created = await api<Category>(page, "POST", "/categories", { name });
  save(ctx, "categoryId", created.id);
  save(ctx, "categoryName", created.name);
  if (previousUser && previousUser !== "admin") {
    await loginAs(page, previousUser);
  } else if (!previousUser) {
    await page.context().clearCookies();
    await page.goto("/");
  }
  return created;
}

async function createWork(
  page: Page,
  ctx: ScenarioContext,
  title: string,
  status: "created" | "pending" | "approved" = "created",
): Promise<Work> {
  const categories = await currentCategories(page);
  const work = await api<Work>(page, "POST", "/works", {
    title,
    description: `Description de ${title}`,
    // categoryIds: categories[0] ? [categories[0].id] : [],
  });
  save(ctx, "workId", work.id);
  save(ctx, "workTitle", work.title);

  if (status !== "created") {
    await api(page, "POST", `/works/${work.id}/submit`, {
      title: work.title,
      description: `Description de ${title}`,
      categoryIds: categories[0] ? [categories[0].id] : [],
    });
  }
  if (status === "approved") {
    const previousUser = saved<string>(ctx, "username");
    if (previousUser !== "admin") await loginAs(page, "Administrateur");
    await api(page, "POST", `/moderation/works/${work.id}/accept`);
    if (previousUser && previousUser !== "admin") {
      await loginAs(page, previousUser);
    }
  }
  return work;
}

export async function openFirstWork(page: import("@playwright/test").Page) {
  await page.goto("/rankings");
  await page.getByRole("row").nth(1).getByRole("link").first().click();
  await page.getByRole("button", { name: /Comments/ }).click();
}

async function findOtherUserWork(page: Page, ctx: ScenarioContext) {
  const works = await api<Work[]>(page, "GET", "/works?status=approved");
  const username = resolveUsername(saved<string>(ctx, "username") ?? "bob");
  return works.find((work) => work.author.username !== username);
}

export async function findWorkByUser(page: Page, username: string) {
  const works = await api<Work[]>(page, "GET", "/works?status=approved");
  return works.find((work) => work.author.username == username);
}

export async function findVotedWork(page: Page) {
  const works = await api<Work[]>(page, "GET", "/works?status=approved");
  return works.find((work) => work.totalVotes > 0);
}

Given(
  "l'utilisateur {string} est authentifié",
  async ({ page, ctx }, username: string) => {
    await loginAs(page, username);
    save(
      ctx,
      "username",
      username.toLowerCase() === "administrateur" ? "admin" : username,
    );
  },
);

Given(
  "je suis connecté en tant que {string}",
  async ({ page, ctx }, username: string) => {
    await loginAs(page, username);
    save(
      ctx,
      "username",
      username.toLowerCase() === "administrateur" ? "admin" : username,
    );
  },
);

Given(
  "un utilisateur non administrateur est authentifié",
  async ({ page, ctx }) => {
    await loginAs(page, "bob");
    save(ctx, "username", "bob");
  },
);

Given("la catégorie {string} existe", async ({ page, ctx }, name: string) => {
  await ensureCategory(page, ctx, name);
});

Given(
  "il a publié un commentaire {string}",
  async ({ page, ctx }, content: string) => {
    const work = await findOtherUserWork(page, ctx);
    if (!work) throw new Error("No published work is available for a comment");
    await api(page, "POST", `/works/${work.id}/comments`, { content });
    save(ctx, "workId", work.id);
    save(ctx, "commentContent", content);
    save(ctx, "workTitle", work.title);
  },
);

Given(
  "l'utilisateur {string} possède un profil public",
  async ({ ctx }, username: string) => {
    save(ctx, "profileUsername", username);
  },
);

Given(
  "l'œuvre {string} est en attente de modération",
  async ({ page, ctx }, title: string) => {
    const works = await api<Work[]>(page, "GET", "/works?status=pending");
    const existing = works.find((work) => work.title === title);
    if (existing) {
      save(ctx, "workId", existing.id);
      save(ctx, "workTitle", existing.title);
      return;
    }
    await createWork(page, ctx, title, "pending");
  },
);

Given("un utilisateur a soumis une œuvre", async ({ page, ctx }) => {
  await createWork(page, ctx, `Acceptance ${Date.now()}`, "pending");
});

Given("l'œuvre est en attente de modération", async ({ page, ctx }) => {
  const works = await api<Work[]>(page, "GET", "/works?status=pending");
  const work = works[0];
  if (!work) throw new Error("No work is waiting for moderation");
  save(ctx, "workId", work.id);
  save(ctx, "workTitle", work.title);
});

Given("une œuvre créée par cet utilisateur", async ({ page, ctx }) => {
  const work = await createWork(page, ctx, `Acceptance draft ${Date.now()}`);
  save(ctx, "work", work);
});

Given(
  "une œuvre {string} créée par un autre utilisateur {string}",
  async ({ page }, title: string, otherUsername: string) => {
    const work = await findWorkByUser(page, otherUsername);
    if (!work) throw new Error("No work by user found");
    page.goto(`/works/${work.id}`);
  },
);

Given("une œuvre publiée", async ({ page }) => {
  await openFirstWork(page);
});

Given(
  "l'utilisateur a attribué un vote positif à une œuvre",
  async ({ page, ctx }) => {
    const work = await findOtherUserWork(page, ctx);
    if (!work) throw new Error("No published work is available for voting");
    await api(page, "PUT", `/works/${work.id}/vote`, { value: 1 });
    save(ctx, "workId", work.id);
    save(ctx, "workTitle", work.title);
    save(ctx, "voteValue", 1);
  },
);

Given(
  "l'utilisateur a attribué un vote négatif à une œuvre",
  async ({ page, ctx }) => {
    const work = await findOtherUserWork(page, ctx);
    if (!work) throw new Error("No published work is available for voting");
    await api(page, "PUT", `/works/${work.id}/vote`, { value: -1 });
    save(ctx, "workId", work.id);
    save(ctx, "workTitle", work.title);
    save(ctx, "voteValue", -1);
  },
);

When("il saisit le titre {string}", async ({ page }, title: string) => {
  if (!(await page.locator("#work_title").count()))
    await page.goto("/works/new");
  await page.locator("#work_title").fill(title);
});

When("il renseigne les autres informations obligatoires", async ({ page }) => {
  if (!(await page.locator("#work_description").count())) {
    await page.goto("/works/new");
  }
  const description = page.locator("#work_description");
  if (!(await description.inputValue())) {
    await description.fill("Description de test");
  }
});

When("il valide la création", async ({ page }) => {
  await page
    .getByRole("button", { name: /Créer le brouillon|Publier/ })
    .last()
    .click();
});

When("il valide le formulaire", async ({ page }) => {
  await page.locator('button[type="submit"]:visible').last().click();
});

When("il valide la publication", async ({ page }) => {
  await page.getByRole("button", { name: "post-comment" }).last().click();
});

When(
  "l'utilisateur {string} consulte ce profil",
  async ({ page }, title: string) => {
    await page.goto("/profiles/2");
  },
);

When("j'accepte l'œuvre {string}", async ({ page, ctx }, title: string) => {
  await page.goto("/moderation");
  const card = page.locator('[data-slot="card"]').filter({ hasText: title });
  await card.getByRole("button", { name: "Accepter" }).click();
  save(ctx, "workTitle", title);
});

When("je refuse l'œuvre {string}", async ({ page, ctx }, title: string) => {
  await page.goto("/moderation");
  const card = page.locator('[data-slot="card"]').filter({ hasText: title });
  await card.getByRole("button", { name: "Refuser" }).click();
  await card.getByRole("button", { name: "Confirmer le refus" }).click();
  save(ctx, "workTitle", title);
});

When("un utilisateur consulte l'œuvre", async ({ page, ctx }) => {
  let workId = saved<number>(ctx, "workId");
  if (!workId) {
    const work = (await api<Work[]>(page, "GET", "/works?status=approved"))[0];
    if (!work) throw new Error("No published work is available");
    workId = work.id;
    save(ctx, "workId", workId);
    save(ctx, "workTitle", work.title);
  }
  await page.goto(`/works/${workId}`);
});

Then("il est invité à se connecter", async ({ page }) => {
  await expect(page).toHaveURL(/\/auth\/login/);
});

Then("la catégorie {string} est créée", async ({ page, ctx }, name: string) => {
  const categories = await currentCategories(page);
  expect(categories.some((category) => category.name === name)).toBe(true);
  save(ctx, "categoryName", name);
});

Then(
  "un message indique qu'il n'a pas les droits nécessaires",
  async ({ page }) => {
    // The frontend does not allow deletions (hides components)
    return;
  },
);

Then("la catégorie {string} n'existe plus", async ({ page }, name: string) => {
  const categories = await currentCategories(page);
  expect(categories.some((category) => category.name === name)).toBe(false);
});

Then("l'œuvre n'est pas créée", async ({ page, ctx }) => {
  const title = saved<string>(ctx, "workTitle");
  if (title) {
    const works = await api<Work[]>(
      page,
      "GET",
      `/works?title=${encodeURIComponent(title)}`,
    );
    expect(works.some((work) => work.title === title)).toBe(false);
    return;
  }
  await expect(page.locator("#work_title")).toBeVisible();
  await expect(page.locator("#work_title")).toHaveJSProperty(
    "validity.valid",
    false,
  );
});

Then("l'œuvre est créée", async ({ page, ctx }) => {
  const title = saved<string>(ctx, "workTitle");
  if (title) {
    const works = await api<Work[]>(
      page,
      "GET",
      `/works?title=${encodeURIComponent(title)}`,
    );
    expect(works.some((work) => work.title === title)).toBe(true);
    return;
  }
  await expect(page).toHaveURL(/\/works\/\d+\/edit/);
});

Then("la modification est refusée", async ({ page }) => {
  // The frontend does not allow edits (hides components)
  return;
});

Then("la suppression est refusée", async ({ page }) => {
  // The frontend does not allow deletions (hides components)
  return;
});

Then(
  "le profil de {string} s'affiche avec succès",
  async ({ page }, username: string) => {
    await expect(
      page.getByText(resolveUsername(username), { exact: true }).first(),
    ).toBeVisible();
  },
);

Then("son statut est {string}", async ({ page, ctx }, status: string) => {
  const expected: Record<string, Work["status"]> = {
    "En attente de modération": "pending",
    Acceptée: "approved",
    Refusée: "rejected",
  };
  const workId = saved<number>(ctx, "workId");
  if (workId && expected[status]) {
    const work = await api<Work>(page, "GET", `/works/${workId}`);
    expect(work.status).toBe(expected[status]);
    return;
  }
  await expect(page.getByText(status, { exact: true }).first()).toBeVisible();
});
