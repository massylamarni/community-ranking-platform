/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "@jest/globals";
import RankingArchivesPage from "@/app/rankings/archives/page";
import { categoriesRepository } from "@/repositories/categories.repository";
import { rankingsRepository } from "@/repositories/rankings.repository";
import {
  mockPush,
  mockSearchParams,
} from "../shared/mocks/navigation";
import type { Category, RankingPage } from "@/types/api";

jest.mock(
  "next/navigation",
  () =>
    jest.requireActual<typeof import("../shared/mocks/navigation")>(
      "../shared/mocks/navigation",
    ).navigationModule,
);

jest.mock("@/repositories/categories.repository", () => ({
  categoriesRepository: {
    list: jest.fn(),
  },
}));

jest.mock("@/repositories/rankings.repository", () => ({
  rankingsRepository: {
    list: jest.fn(),
    listArchives: jest.fn(),
    listArchivedPeriods: jest.fn(),
  },
}));

const mockCategories: Category[] = [
  { id: 1, name: "Photographie" },
  { id: 2, name: "Littérature" },
  { id: 3, name: "Musique" },
];

const mockArchivedRankingData: RankingPage = {
  items: [
    {
      id: 201,
      position: 1,
      title: "Fragments d'Acier",
      author: "charlie",
      categories: ["Sculpture"],
      score: 30,
      imageUrl: null,
      description: "Oeuvre de sculpture",
    },
    {
      id: 202,
      position: 2,
      title: "Lumière d'Automne",
      author: "bob",
      categories: ["Photographie"],
      score: 28,
      imageUrl: null,
      description: "Photo d'automne",
    },
    {
      id: 203,
      position: 3,
      title: "Le Cri Silencieux",
      author: "alice",
      categories: ["Peinture"],
      score: 22,
      imageUrl: null,
      description: "Tableau expressif",
    },
    {
      id: 204,
      position: 4,
      title: "Urbanisme Poétique",
      author: "bob",
      categories: ["Photographie", "Design"],
      score: 19,
      imageUrl: null,
      description: "Design urbain",
    },
  ],
  page: 1,
  pageSize: 10,
  total: 4,
};

describe("RankingArchivesPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams({});
    (categoriesRepository.list as jest.Mock).mockResolvedValue(mockCategories);
    (rankingsRepository.listArchivedPeriods as jest.Mock).mockResolvedValue([
      "2026-09-28",
      "2026-09-21",
    ]);
    (rankingsRepository.listArchives as jest.Mock).mockResolvedValue(
      mockArchivedRankingData,
    );
  });

  it("renders page title, closure date in header, category control, and table headers matching rankings UI", async () => {
    render(<RankingArchivesPage />);

    expect(await screen.findByText("Classements archivés")).toBeDefined();

    // Verify closure date (date d'archivage) is displayed in the dashboard header (2026-09-28 + 6 days = 04/10/2026)
    expect(await screen.findByText("Date d'archivage : 04/10/2026")).toBeDefined();

    // Verify 'Type de période', 'Période clôturée', 'Trier par' are completely removed
    expect(screen.queryByLabelText("Type de période")).toBeNull();
    expect(screen.queryByLabelText("Période clôturée")).toBeNull();
    expect(screen.queryByLabelText("Trier par")).toBeNull();

    // Period selector and Category filter with Filtrer button are present
    expect(screen.getByLabelText("Période archivée")).toBeDefined();
    expect(screen.getByLabelText("Catégorie")).toBeDefined();
    expect(screen.getByRole("button", { name: /filtrer/i })).toBeDefined();

    // Verify archived works are displayed matching rankings UI
    expect(await screen.findByText("Fragments d'Acier")).toBeDefined();
    expect(screen.getByText("Lumière d'Automne")).toBeDefined();
    expect(screen.getByText("Le Cri Silencieux")).toBeDefined();
    expect(screen.getByText("Urbanisme Poétique")).toBeDefined();

    // Table headers match rankings view
    expect(screen.getByText("Position")).toBeDefined();
    expect(screen.getByText("Œuvre")).toBeDefined();
    expect(screen.getByText("Catégories")).toBeDefined();
    expect(screen.queryByText("Date")).toBeNull();
    expect(screen.getByText("Score final")).toBeDefined();

    expect(screen.getByText("30")).toBeDefined();
  });

  it("always queries archives by recently ended date without client-side re-sorting", async () => {
    render(<RankingArchivesPage />);

    await waitFor(() => {
      expect(rankingsRepository.listArchives).toHaveBeenCalledWith({
        periodType: "week",
        periodStart: "2026-09-28",
        categoryId: undefined,
        page: 1,
        pageSize: 10,
      });
    });
  });

  it("initializes from URL query parameters (category and periodStart)", async () => {
    mockSearchParams({
      category: "3",
      periodStart: "2026-09-21",
    });

    render(<RankingArchivesPage />);

    await waitFor(() => {
      expect(rankingsRepository.listArchives).toHaveBeenCalledWith(
        expect.objectContaining({
          periodType: "week",
          periodStart: "2026-09-21",
          categoryId: 3,
          page: 1,
          pageSize: 10,
        }),
      );
    });

    expect(
      await screen.findByText("Classements archivés : Musique"),
    ).toBeDefined();
  });

  it("submitting filter form updates URL query parameters", async () => {
    mockSearchParams({
      category: "1",
    });

    render(<RankingArchivesPage />);

    await screen.findByText("Fragments d'Acier");

    const submitButton = screen.getByRole("button", { name: /filtrer/i });
    fireEvent.click(submitButton);

    expect(mockPush).toHaveBeenCalledWith("/rankings/archives?category=1");
  });

  it("renders empty state when no archives exist for criteria", async () => {
    (rankingsRepository.listArchives as jest.Mock).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
    });

    render(<RankingArchivesPage />);

    expect(
      await screen.findByText("Aucun classement archivé"),
    ).toBeDefined();
    // Filter controls remain present
    expect(screen.getByLabelText("Catégorie")).toBeDefined();
  });

  it("renders error alert with retry button when loading archives fails", async () => {
    (rankingsRepository.listArchives as jest.Mock).mockRejectedValue(
      new Error("Server error"),
    );

    render(<RankingArchivesPage />);

    expect(
      await screen.findByText(/impossible de charger les classements archivés/i),
    ).toBeDefined();

    const retryButton = screen.getByRole("button", { name: /réessayer/i });
    expect(retryButton).toBeDefined();

    // After retry succeeds
    (rankingsRepository.listArchives as jest.Mock).mockResolvedValue(
      mockArchivedRankingData,
    );
    fireEvent.click(retryButton);

    expect(await screen.findByText("Fragments d'Acier")).toBeDefined();
  });

  it("resets filters when clicking Réinitialiser", async () => {
    mockSearchParams({
      category: "2",
    });

    render(<RankingArchivesPage />);

    const resetButton = await screen.findByRole("button", {
      name: /réinitialiser/i,
    });
    fireEvent.click(resetButton);

    expect(mockPush).toHaveBeenCalledWith("/rankings/archives");
  });

  it("fulfills CLAS-007 acceptance criteria: displayed ranking is exactly the archived one (B, A, C)", async () => {
    const weekRankingData: RankingPage = {
      items: [
        { id: 11, position: 1, title: "Oeuvre B", author: "artiste2", categories: [], score: 45, description: "" },
        { id: 12, position: 2, title: "Oeuvre A", author: "artiste1", categories: [], score: 32, description: "" },
        { id: 13, position: 3, title: "Oeuvre C", author: "artiste3", categories: [], score: 18, description: "" },
      ],
      page: 1,
      pageSize: 10,
      total: 3,
    };

    (rankingsRepository.listArchives as jest.Mock).mockResolvedValue(weekRankingData);

    render(<RankingArchivesPage />);

    expect(await screen.findByText("Oeuvre B")).toBeDefined();
    expect(screen.getByText("Oeuvre A")).toBeDefined();
    expect(screen.getByText("Oeuvre C")).toBeDefined();

    const rows = screen.getAllByRole("row");
    // Row 0 is header, rows 1, 2, 3 correspond to Oeuvre B, A, C
    expect(rows[1].textContent).toContain("Oeuvre B");
    expect(rows[2].textContent).toContain("Oeuvre A");
    expect(rows[3].textContent).toContain("Oeuvre C");
  });
});
