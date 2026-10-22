// Feature: Affichage de l'activité
import { Given, Then } from "../fixtures";
import { expect, type Page } from "@playwright/test";

type ActivityProfile = {
  userId: number;
  username: string;
  publishedWorks: {
    oeuvreId: number;
    title: string;
    description: string;
    imageUrl: null;
    score: number;
    totalVotes: number;
    createdAt: string;
  }[];
  comments: {
    commentId: number;
    content: string;
    imageUrl: null;
    createdAt: string;
    oeuvreId: number;
    oeuvreTitle: string;
    parentCommentId: null;
  }[];
  votedWorks: {
    oeuvreId: number;
    title: string;
    imageUrl: null;
    score: number;
    totalVotes: number;
    voteValue: 1;
  }[];
};

async function showActivityProfile(page: Page, profile: ActivityProfile) {
  if (page.url().endsWith("/profiles/77")) return;
  await page.route("**/backend-api/users/77/public_profile", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(profile),
    }),
  );
  await page.goto("/profiles/77");
}

Given(
  "l'utilisateur {string} a publié 2 œuvres, 1 commentaire, et voté positivement pour 3 œuvres",
  async ({ page, ctx }, arg1: string) => {
    const profile: ActivityProfile = {
      userId: 77,
      username: "Frédégonde",
      publishedWorks: [
        {
          oeuvreId: 101,
          title: "Œuvre publiée 1",
          description: "",
          imageUrl: null,
          score: 2,
          totalVotes: 2,
          createdAt: "2026-01-01T00:00:00Z",
        },
        {
          oeuvreId: 102,
          title: "Œuvre publiée 2",
          description: "",
          imageUrl: null,
          score: 1,
          totalVotes: 1,
          createdAt: "2026-01-02T00:00:00Z",
        },
      ],
      comments: [
        {
          commentId: 201,
          content: "Commentaire de Frédégonde",
          imageUrl: null,
          createdAt: "2026-01-03T00:00:00Z",
          oeuvreId: 101,
          oeuvreTitle: "Œuvre publiée 1",
          parentCommentId: null,
        },
      ],
      votedWorks: [
        {
          oeuvreId: 301,
          title: "Favori 1",
          imageUrl: null,
          score: 4,
          totalVotes: 5,
          voteValue: 1,
        },
        {
          oeuvreId: 302,
          title: "Favori 2",
          imageUrl: null,
          score: 3,
          totalVotes: 4,
          voteValue: 1,
        },
        {
          oeuvreId: 303,
          title: "Favori 3",
          imageUrl: null,
          score: 2,
          totalVotes: 3,
          voteValue: 1,
        },
      ],
    };
    ctx.activityProfile = profile;
    expect(arg1).toBe("Frédégonde");
    await showActivityProfile(page, profile);
  },
);

Then(
  "ses 2 œuvres publiées sont affichées sur son profil",
  async ({ page, ctx }) => {
    const profile = ctx.activityProfile as ActivityProfile;
    await showActivityProfile(page, profile);
    await expect(page.getByRole("tab", { name: /Œuvres/ })).toContainText("2");
    await expect(
      page.getByText("Œuvre publiée 1", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Œuvre publiée 2", { exact: true }),
    ).toBeVisible();
  },
);

Then("son commentaire est affiché sur son profil", async ({ page, ctx }) => {
  const profile = ctx.activityProfile as ActivityProfile;
  await showActivityProfile(page, profile);
  await page.getByRole("tab", { name: /Commentaires/ }).click();
  await expect(page.getByText("Commentaire de Frédégonde")).toBeVisible();
});

Then(
  "les 3 œuvres qu'elle a votées positivement sont affichées comme favoris sur son profil",
  async ({ page, ctx }) => {
    const profile = ctx.activityProfile as ActivityProfile;
    await showActivityProfile(page, profile);
    await page.getByRole("tab", { name: /Favoris/ }).click();
    await expect(page.getByRole("tab", { name: /Favoris/ })).toContainText("3");
    for (const work of profile.votedWorks) {
      await expect(page.getByText(work.title, { exact: true })).toBeVisible();
    }
    await page.unrouteAll();
  },
);
