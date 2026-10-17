/** @jest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "@jest/globals";
import MyWorks from "@/app/works/mine/page";
import type { Work } from "@/types/api";
import { createWork, deferred } from "../../shared/utils";
import { mockReplace } from "../../shared/mocks/navigation";
import { mockAuthState } from "../../shared/mocks/auth";
import { mockWorksList, workActions } from "../../shared/mocks/works";

jest.mock(
  "next/navigation",
  () =>
    jest.requireActual<typeof import("../../shared/mocks/navigation")>(
      "../../shared/mocks/navigation",
    ).navigationModule,
);
jest.mock(
  "next/link",
  () =>
    jest.requireActual<typeof import("../../shared/mocks/ui")>(
      "../../shared/mocks/ui",
    ).linkModule,
);
jest.mock(
  "@/hooks/use-auth",
  () =>
    jest.requireActual<typeof import("../../shared/mocks/auth")>(
      "../../shared/mocks/auth",
    ).authModule,
);
jest.mock(
  "@/hooks/use-work",
  () =>
    jest.requireActual<typeof import("../../shared/mocks/works")>(
      "../../shared/mocks/works",
    ).useWorksModule,
);
jest.mock(
  "@/components/guards/loadingGuard",
  () =>
    jest.requireActual<typeof import("../../shared/mocks/guards")>(
      "../../shared/mocks/guards",
    ).loadingGuardModule,
);
jest.mock(
  "@/app/works/_components/noPersonalWork",
  () =>
    jest.requireActual<typeof import("../../shared/mocks/views")>(
      "../../shared/mocks/views",
    ).noPersonalWorkModule,
);
jest.mock(
  "@/app/works/_components/filterHasNoWork",
  () =>
    jest.requireActual<typeof import("../../shared/mocks/views")>(
      "../../shared/mocks/views",
    ).filterHasNoWorkModule,
);

const { list } = workActions;

const setup = (
  works: Work[],
  overrides: Parameters<typeof mockWorksList>[1] = {},
) => {
  mockWorksList(works, overrides);
  return render(<MyWorks />);
};

const renderLoaded = async (
  works: Work[],
  overrides: Parameters<typeof mockWorksList>[1] = {},
) => {
  const utils = setup(works, overrides);
  await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
  return utils;
};

const manyWorks = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    createWork(i + 1, "alice", { title: `Work ${i + 1}` }),
  );

const search = () =>
  screen.getByRole("textbox", { name: "Rechercher dans vos œuvres" });

describe("MyWorks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    list.mockResolvedValue(undefined);
    mockAuthState({ username: "alice" });
  });

  describe("auth and loading", () => {
    it.each<[string, () => void, Parameters<typeof mockWorksList>[1]]>([
      ["the user is loading", () => mockAuthState(null, true), {}],
      ["the works hook is loading", () => {}, { loading: true }],
    ])("shows the loading guard while %s", (_label, arrange, overrides) => {
      arrange();
      setup([], overrides);
      expect(screen.getByTestId("loading")).toBeDefined();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("redirects to login and renders nothing when logged out", () => {
      mockAuthState(null);
      const { container } = setup([]);
      expect(mockReplace).toHaveBeenCalledWith("/auth/login?from=/works/mine");
      expect(list).not.toHaveBeenCalled();
      expect(container.firstChild).toBeNull();
    });

    it("shows the loading guard until list() resolves", async () => {
      const pending = deferred<void>();
      list.mockReturnValue(pending.promise);
      setup([createWork(1, "alice")]);
      expect(screen.getByTestId("loading")).toBeDefined();

      pending.resolve();
      await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
      expect(screen.getByText("Mes œuvres")).toBeDefined();
    });

    it("displays the error message from the hook", async () => {
      await renderLoaded([], { error: { message: "Erreur réseau" } });
      expect(screen.getByRole("alert").textContent).toBe("Erreur réseau");
    });
  });

  describe("content", () => {
    it("only displays works owned by the current user", async () => {
      await renderLoaded([
        createWork(1, "alice", { title: "Mine" }),
        createWork(2, "bob", { title: "Not mine" }),
      ]);
      expect(screen.getByText("Mine")).toBeDefined();
      expect(screen.queryByText("Not mine")).toBeNull();
    });

    it("renders the empty state when the user owns no work", async () => {
      await renderLoaded([createWork(1, "bob")]);
      expect(screen.getByTestId("no-personal-work")).toBeDefined();
      expect(screen.queryByRole("table")).toBeNull();
    });

    it("shows the rejection notice only for rejected works", async () => {
      await renderLoaded([
        createWork(1, "alice", { status: "rejected" }),
        createWork(2, "alice", { status: "approved" }),
      ]);
      expect(screen.getAllByText("Motif du refus indisponible.")).toHaveLength(
        1,
      );
    });

    it("lists the categories of a work, or 'Aucune' when it has none", async () => {
      await renderLoaded([
        createWork(1, "alice", { categories: ["Poésie", "Roman"] }),
        createWork(2, "alice", { categories: [] }),
      ]);
      expect(screen.getByText("Poésie")).toBeDefined();
      expect(screen.getByText("Roman")).toBeDefined();
      expect(screen.getByText("Aucune")).toBeDefined();
    });
  });

  describe("row actions", () => {
    it.each([
      ["created", "Continuer", "/works/7/edit"],
      ["rejected", "Modifier", "/works/7/edit"],
      ["pending", "Voir", "/works/7"],
      ["approved", "Voir", "/works/7"],
    ] as const)("a %s work offers '%s'", async (status, label, href) => {
      await renderLoaded([createWork(7, "alice", { status })]);
      expect(
        screen.getByRole("link", { name: label }).getAttribute("href"),
      ).toBe(href);
    });
  });

  describe("status tabs", () => {
    const works = () => [
      createWork(1, "alice", { title: "Created one", status: "created" }),
      createWork(2, "alice", { title: "Rejected one", status: "rejected" }),
      createWork(3, "alice", { title: "Rejected two", status: "rejected" }),
      createWork(4, "alice", { title: "Pending one", status: "pending" }),
      createWork(5, "alice", { title: "Approved one", status: "approved" }),
      createWork(6, "bob", { title: "Bob's", status: "rejected" }),
    ];

    it("displays a count per status, excluding other users' works", async () => {
      await renderLoaded(works());
      const count = (name: RegExp) =>
        screen.getByRole("tab", { name }).textContent;
      expect(count(/Toutes/)).toContain("5");
      expect(count(/Créées/)).toContain("1");
      expect(count(/Refusées/)).toContain("2");
      expect(count(/En examen/)).toContain("1");
      expect(count(/Approuvées/)).toContain("1");
    });

    it("filters the table when a status tab is selected", async () => {
      const user = userEvent.setup();
      await renderLoaded(works());

      await user.click(screen.getByRole("tab", { name: /Refusées/ }));

      expect(screen.getByText("Rejected one")).toBeDefined();
      expect(screen.getByText("Rejected two")).toBeDefined();
      expect(screen.queryByText("Created one")).toBeNull();
      expect(screen.queryByText("Pending one")).toBeNull();
    });
  });

  describe("search", () => {
    const works = () => [
      createWork(1, "alice", {
        title: "Les Fleurs",
        description: "Un recueil",
        categories: ["Poésie"],
      }),
      createWork(2, "alice", {
        title: "Nuit blanche",
        description: "Une enquête",
        categories: ["Roman"],
      }),
    ];

    it.each([
      ["title, case-insensitively", "FLEURS", "Les Fleurs", "Nuit blanche"],
      ["description", "enquête", "Nuit blanche", "Les Fleurs"],
      ["category", "poésie", "Les Fleurs", "Nuit blanche"],
    ])("filters by %s", async (_label, query, shown, hidden) => {
      const user = userEvent.setup();
      await renderLoaded(works());
      await user.type(search(), query);
      expect(screen.getByText(shown)).toBeDefined();
      expect(screen.queryByText(hidden)).toBeNull();
    });

    it("renders the filter empty state when nothing matches", async () => {
      const user = userEvent.setup();
      await renderLoaded(works());
      await user.type(search(), "zzzzz");
      expect(screen.getByTestId("filter-has-no-work")).toBeDefined();
      expect(screen.queryByTestId("no-personal-work")).toBeNull();
    });

    it("combines search and status filter", async () => {
      const user = userEvent.setup();
      await renderLoaded([
        createWork(1, "alice", { title: "Alpha", status: "approved" }),
        createWork(2, "alice", { title: "Alpha bis", status: "rejected" }),
        createWork(3, "alice", { title: "Beta", status: "rejected" }),
      ]);

      await user.click(screen.getByRole("tab", { name: /Refusées/ }));
      await user.type(search(), "alpha");

      expect(screen.getByText("Alpha bis")).toBeDefined();
      expect(screen.queryByText("Beta")).toBeNull();
      expect(screen.queryByText("Alpha")).toBeNull();
    });
  });

  describe("pagination", () => {
    it("is hidden when there are 10 works or fewer", async () => {
      await renderLoaded(manyWorks(10));
      expect(screen.queryByText(/Affichage de/)).toBeNull();
    });

    it("shows the first page of 10 rows when there are more", async () => {
      await renderLoaded(manyWorks(11));
      expect(screen.getByText("Affichage de 1 à 10 sur 11")).toBeDefined();
      expect(screen.getByText("Page 1 sur 2")).toBeDefined();
      expect(screen.getAllByRole("row")).toHaveLength(11); // header + 10
      expect(screen.queryByText("Work 11")).toBeNull();
    });

    it("counts only filtered results in the pagination summary", async () => {
      const user = userEvent.setup();
      await renderLoaded([
        ...manyWorks(11),
        createWork(100, "alice", { title: "Special" }),
      ]);
      expect(screen.getByText("Affichage de 1 à 10 sur 12")).toBeDefined();

      await user.type(search(), "special");
      expect(screen.queryByText(/Affichage de/)).toBeNull();
      expect(screen.getByText("Special")).toBeDefined();
    });
  });
});
