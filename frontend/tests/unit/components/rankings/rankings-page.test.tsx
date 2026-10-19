/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "@jest/globals";
import RankingsPage from "@/app/rankings/page";
import { categoriesRepository } from "@/repositories/categories.repository";
import { rankingsRepository } from "@/repositories/rankings.repository";
import {
  mockPush,
  mockSearchParams,
} from "../../shared/mocks/other/navigation";
import type { Category, RankingPage } from "@/types/api";

jest.mock(
  "next/navigation",
  () =>
    jest.requireActual<typeof import("../../shared/mocks/other/navigation")>(
      "../../shared/mocks/other/navigation",
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
    listGlobal: jest.fn(),
  },
}));

const mockCategories: Category[] = [
  { id: 1, name: "Photographie" },
  { id: 2, name: "Littérature" },
  { id: 3, name: "Musique" },
];

const mockRankingData: RankingPage = {
  items: [
    {
      id: 101,
      position: 1,
      title: "Symphonie No 5",
      author: { id: 1, username: "Beethoven" },
      categories: ["Musique"],
      score: 42,
      imageUrl: null,
      description: "Superbe œuvre",
    },
    {
      id: 102,
      position: 2,
      title: "Clair de Lune",
      author: { id: 2, username: "Debussy" },
      categories: ["Musique"],
      score: 30,
      imageUrl: null,
      description: "Classique",
    },
  ],
  page: 1,
  pageSize: 10,
  total: 2,
};

describe("RankingsPage Component with Filters (CLAS-011, CLAS-012)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams({});
    (categoriesRepository.list as jest.Mock).mockResolvedValue(mockCategories);
    (rankingsRepository.list as jest.Mock).mockResolvedValue(mockRankingData);
  });

  it("renders page header, category and period filter controls, and ranking table", async () => {
    render(<RankingsPage />);

    expect(await screen.findByText("Classement global")).toBeDefined();
    expect(screen.getByLabelText("Catégorie")).toBeDefined();
    expect(screen.getByLabelText("Période")).toBeDefined();
    expect(screen.getByRole("button", { name: /filtrer/i })).toBeDefined();

    // Verify table items
    expect(await screen.findByText("Symphonie No 5")).toBeDefined();
    expect(screen.getByText("Clair de Lune")).toBeDefined();
    expect(screen.getByText("#1")).toBeDefined();
    expect(screen.getByText("42")).toBeDefined();
  });

  it("CLAS-011 & CLAS-012: initializes from URL query params and queries repository with them", async () => {
    mockSearchParams({ category: "3", period: "month" });

    render(<RankingsPage />);

    await waitFor(() => {
      expect(rankingsRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: 3,
          period: "month",
          page: 1,
          pageSize: 10,
        }),
      );
    });

    expect(await screen.findByText("Classement : Musique")).toBeDefined();
  });

  it("submitting the filter form navigates with updated URL query params", async () => {
    mockSearchParams({});

    render(<RankingsPage />);

    await screen.findByText("Symphonie No 5");

    const submitButton = screen.getByRole("button", { name: /filtrer/i });
    fireEvent.click(submitButton);

    // With defaults ('all'), navigating results in /rankings
    expect(mockPush).toHaveBeenCalledWith("/rankings");
  });

  it("renders empty state when no works match criteria while preserving filter bar", async () => {
    (rankingsRepository.list as jest.Mock).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
    });

    render(<RankingsPage />);

    expect(await screen.findByText("Rien ici pour le moment")).toBeDefined();
    // Filter controls should remain accessible
    expect(screen.getByLabelText("Catégorie")).toBeDefined();
    expect(screen.getByLabelText("Période")).toBeDefined();
    expect(screen.getByRole("button", { name: /filtrer/i })).toBeDefined();
  });

  it("renders error banner and retry button when fetching fails", async () => {
    (rankingsRepository.list as jest.Mock).mockRejectedValue(
      new Error("Network Error"),
    );

    render(<RankingsPage />);

    expect(
      await screen.findByText(/impossible de charger le classement/i),
    ).toBeDefined();

    const retryButton = screen.getByRole("button", { name: /réessayer/i });
    expect(retryButton).toBeDefined();

    // Clicking retry calls repository again
    (rankingsRepository.list as jest.Mock).mockResolvedValue(mockRankingData);
    fireEvent.click(retryButton);

    expect(await screen.findByText("Symphonie No 5")).toBeDefined();
  });

  it("resets filters when clicking Réinitialiser", async () => {
    mockSearchParams({ category: "3", period: "month" });

    render(<RankingsPage />);

    const resetButton = await screen.findByRole("button", {
      name: /réinitialiser/i,
    });
    fireEvent.click(resetButton);

    expect(mockPush).toHaveBeenCalledWith("/rankings");
  });
});
