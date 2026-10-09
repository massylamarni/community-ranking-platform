/** @jest-environment jsdom */

import { render, screen, waitFor, within } from "@testing-library/react";
import fireEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "@jest/globals";
import MyWorks from "@/app/works/mine/page";
import type { Work } from "@/types/api";
import { createWork } from "../utils";

const mockReplace = jest.fn();
const mockList = jest.fn();
let mockAuth: { user: { username: string } | null; userLoading: boolean };
let mockWorks: {
  works: Work[];
  list: typeof mockList;
  loading: boolean;
  error: { message: string } | null;
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children?: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockAuth,
}));

jest.mock("@/hooks/use-work", () => ({
  useWorks: () => mockWorks,
}));

jest.mock("@/components/guards/loadingGuard", () => ({
  __esModule: true,
  default: () => <div data-testid="loading" />,
}));

jest.mock("@/app/works/_components/noPersonalWork", () => ({
  __esModule: true,
  default: () => <div data-testid="no-personal-work" />,
}));

jest.mock("@/app/works/_components/filterHasNoWork", () => ({
  __esModule: true,
  default: () => <div data-testid="filter-has-no-work" />,
}));

const setup = (works: Work[], overrides: Partial<typeof mockWorks> = {}) => {
  mockWorks = {
    works,
    list: mockList,
    loading: false,
    error: null,
    ...overrides,
  };
  return render(<MyWorks />);
};

const renderLoaded = async (
  works: Work[],
  overrides: Partial<typeof mockWorks> = {},
) => {
  const utils = setup(works, overrides);
  await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
  return utils;
};

const manyWorks = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    createWork(i + 1, "alice", { title: `Work ${i + 1}` }),
  );

describe("MyWorks", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockList.mockReset();
    mockList.mockResolvedValue(undefined);
    mockAuth = { user: { username: "alice" }, userLoading: false };
  });

  describe("auth and loading", () => {
    it("shows the loading guard while the user is loading", () => {
      mockAuth = { user: null, userLoading: true };
      setup([]);
      expect(screen.getByTestId("loading")).toBeDefined();
      expect(mockList).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("redirects to login and renders nothing when logged out", () => {
      mockAuth = { user: null, userLoading: false };
      const { container } = setup([]);
      expect(mockReplace).toHaveBeenCalledWith("/auth/login?from=/works/mine");
      expect(mockList).not.toHaveBeenCalled();
      expect(container.firstChild).toBeNull();
    });

    it("shows the loading guard until list() resolves", async () => {
      let resolve!: () => void;
      mockList.mockReturnValue(new Promise<void>((r) => (resolve = r)));
      setup([createWork(1, "alice")]);
      expect(screen.getByTestId("loading")).toBeDefined();

      resolve();
      await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
      expect(screen.getByText("Mes œuvres")).toBeDefined();
    });

    it("shows the loading guard while the works hook is loading", () => {
      setup([], { loading: true });
      expect(screen.getByTestId("loading")).toBeDefined();
    });

    it("still renders the page when list() rejects", async () => {
      mockList.mockRejectedValue(new Error("boom"));
      setup([]);
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
      expect(screen.queryByTestId("filter-has-no-work")).toBeNull();
      expect(screen.queryByRole("table")).toBeNull();
    });

    it("links to the work creation page", async () => {
      await renderLoaded([]);
      const link = screen.getByRole("link", { name: "Créer une œuvre" });
      expect(link.getAttribute("href")).toBe("/works/new");
    });

    it("shows the French label for each status", async () => {
      await renderLoaded([
        createWork(1, "alice", { title: "A", status: "created" }),
        createWork(2, "alice", { title: "B", status: "rejected" }),
        createWork(3, "alice", { title: "C", status: "pending" }),
        createWork(4, "alice", { title: "D", status: "approved" }),
      ]);
      const table = screen.getByRole("table");
      expect(within(table).getByText("Créée")).toBeDefined();
      expect(within(table).getByText("Refusée")).toBeDefined();
      expect(within(table).getByText("En examen")).toBeDefined();
      expect(within(table).getByText("Approuvée")).toBeDefined();
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

    it("shows the vote count", async () => {
      await renderLoaded([createWork(1, "alice", { totalVotes: 42 })]);
      expect(screen.getByText("42")).toBeDefined();
    });

    it("shows 'Aucune' when a work has no category", async () => {
      await renderLoaded([createWork(1, "alice", { categories: [] })]);
      expect(screen.getByText("Aucune")).toBeDefined();
    });

    it("shows the categories of a work", async () => {
      await renderLoaded([
        createWork(1, "alice", { categories: ["Poésie", "Roman"] }),
      ]);
      expect(screen.getByText("Poésie")).toBeDefined();
      expect(screen.getByText("Roman")).toBeDefined();
    });
  });

  describe("row actions", () => {
    it("offers 'Continuer' to a created work", async () => {
      await renderLoaded([createWork(7, "alice", { status: "created" })]);
      const link = screen.getByRole("link", { name: "Continuer" });
      expect(link.getAttribute("href")).toBe("/works/7/edit");
    });

    it("offers 'Modifier' to a rejected work", async () => {
      await renderLoaded([createWork(7, "alice", { status: "rejected" })]);
      const link = screen.getByRole("link", { name: "Modifier" });
      expect(link.getAttribute("href")).toBe("/works/7/edit");
    });

    it.each(["pending", "approved"] as const)(
      "offers 'Voir' to a %s work",
      async (status) => {
        await renderLoaded([createWork(7, "alice", { status })]);
        const link = screen.getByRole("link", { name: "Voir" });
        expect(link.getAttribute("href")).toBe("/works/7");
        expect(screen.queryByRole("link", { name: "Modifier" })).toBeNull();
        expect(screen.queryByRole("link", { name: "Continuer" })).toBeNull();
      },
    );
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

    it("displays a count per status, ignoring other users' works", async () => {
      await renderLoaded(works());
      expect(screen.getByRole("tab", { name: /Toutes/ }).textContent).toContain(
        "5",
      );
      expect(screen.getByRole("tab", { name: /Créées/ }).textContent).toContain(
        "1",
      );
      expect(
        screen.getByRole("tab", { name: /Refusées/ }).textContent,
      ).toContain("2");
      expect(
        screen.getByRole("tab", { name: /En examen/ }).textContent,
      ).toContain("1");
      expect(
        screen.getByRole("tab", { name: /Approuvées/ }).textContent,
      ).toContain("1");
    });

    it("filters the table when a status tab is selected", async () => {
      const user = fireEvent.setup();
      await renderLoaded(works());

      await user.click(screen.getByRole("tab", { name: /Refusées/ }));

      expect(screen.getByText("Rejected one")).toBeDefined();
      expect(screen.getByText("Rejected two")).toBeDefined();
      expect(screen.queryByText("Created one")).toBeNull();
      expect(screen.queryByText("Pending one")).toBeNull();
    });

    it("shows all works again when going back to 'Toutes'", async () => {
      const user = fireEvent.setup();
      await renderLoaded(works());

      await user.click(screen.getByRole("tab", { name: /Refusées/ }));
      await user.click(screen.getByRole("tab", { name: /Toutes/ }));

      expect(screen.getByText("Created one")).toBeDefined();
      expect(screen.getByText("Approved one")).toBeDefined();
    });

    it("renders the filter empty state when a status has no work", async () => {
      const user = fireEvent.setup();
      await renderLoaded([createWork(1, "alice", { status: "created" })]);

      await user.click(screen.getByRole("tab", { name: /Approuvées/ }));

      expect(screen.getByTestId("filter-has-no-work")).toBeDefined();
      expect(screen.queryByTestId("no-personal-work")).toBeNull();
    });
  });

  describe("search", () => {
    const search = () =>
      screen.getByRole("textbox", { name: "Rechercher dans vos œuvres" });

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

    it("filters by title, case-insensitively", async () => {
      const user = fireEvent.setup();
      await renderLoaded(works());
      await user.type(search(), "FLEURS");
      expect(screen.getByText("Les Fleurs")).toBeDefined();
      expect(screen.queryByText("Nuit blanche")).toBeNull();
    });

    it("filters by description", async () => {
      const user = fireEvent.setup();
      await renderLoaded(works());
      await user.type(search(), "enquête");
      expect(screen.getByText("Nuit blanche")).toBeDefined();
      expect(screen.queryByText("Les Fleurs")).toBeNull();
    });

    it("filters by category", async () => {
      const user = fireEvent.setup();
      await renderLoaded(works());
      await user.type(search(), "poésie");
      expect(screen.getByText("Les Fleurs")).toBeDefined();
      expect(screen.queryByText("Nuit blanche")).toBeNull();
    });

    it("ignores surrounding whitespace in the query", async () => {
      const user = fireEvent.setup();
      await renderLoaded(works());
      await user.type(search(), "  fleurs  ");
      expect(screen.getByText("Les Fleurs")).toBeDefined();
      expect(screen.queryByText("Nuit blanche")).toBeNull();
    });

    it("renders the filter empty state when nothing matches", async () => {
      const user = fireEvent.setup();
      await renderLoaded(works());
      await user.type(search(), "zzzzz");
      expect(screen.getByTestId("filter-has-no-work")).toBeDefined();
      expect(screen.queryByTestId("no-personal-work")).toBeNull();
    });

    it("combines search and status filter", async () => {
      const user = fireEvent.setup();
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
      expect(screen.queryByText("Suivant")).toBeNull();
    });

    it("shows the first page of 10 rows when there are more", async () => {
      await renderLoaded(manyWorks(11));
      expect(screen.getByText("Affichage de 1 à 10 sur 11")).toBeDefined();
      expect(screen.getByText("Page 1 sur 2")).toBeDefined();
      // 1 header row + 10 body rows
      expect(screen.getAllByRole("row")).toHaveLength(11);
      expect(screen.queryByText("Work 11")).toBeNull();
    });

    it("disables 'Précédent' on the first page", async () => {
      await renderLoaded(manyWorks(11));
      const previous = screen.getByText("Précédent").closest("a")!;
      const next = screen.getByText("Suivant").closest("a")!;
      expect(previous.getAttribute("aria-disabled")).toBe("true");
      expect(next.getAttribute("aria-disabled")).toBe("false");
    });

    it("navigates to the next and previous page", async () => {
      const user = fireEvent.setup();
      await renderLoaded(manyWorks(11));

      await user.click(screen.getByText("Suivant"));
      expect(screen.getByText("Affichage de 11 à 11 sur 11")).toBeDefined();
      expect(screen.getByText("Page 2 sur 2")).toBeDefined();
      expect(screen.getByText("Work 11")).toBeDefined();
      expect(screen.queryByText("Work 1")).toBeNull();
      expect(
        screen.getByText("Suivant").closest("a")!.getAttribute("aria-disabled"),
      ).toBe("true");

      await user.click(screen.getByText("Précédent"));
      expect(screen.getByText("Affichage de 1 à 10 sur 11")).toBeDefined();
      expect(screen.getByText("Work 1")).toBeDefined();
    });

    it("counts only filtered results in the pagination summary", async () => {
      const user = fireEvent.setup();
      const works = [
        ...manyWorks(11),
        createWork(100, "alice", { title: "Special" }),
      ];
      await renderLoaded(works);
      expect(screen.getByText("Affichage de 1 à 10 sur 12")).toBeDefined();

      await user.type(
        screen.getByRole("textbox", { name: "Rechercher dans vos œuvres" }),
        "special",
      );
      expect(screen.queryByText(/Affichage de/)).toBeNull();
      expect(screen.getByText("Special")).toBeDefined();
    });
  });
});
