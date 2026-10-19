/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import RankingWorkThumbnail from "@/app/rankings/_components/rankingWorkThumbnail";

describe("RankingWorkThumbnail Component", () => {
  it("renders placeholder when imageUrl is not provided", () => {
    render(<RankingWorkThumbnail title="Oeuvre sans image" />);

    const placeholder = screen.getByRole("img", {
      name: "Aperçu indisponible pour Oeuvre sans image",
    });
    expect(placeholder).toBeDefined();
    expect(screen.queryByRole("img", { name: "Oeuvre sans image" })).toBeNull();
  });

  it("renders image when imageUrl is provided", () => {
    render(
      <RankingWorkThumbnail
        imageUrl="https://images.unsplash.com/photo-test"
        title="Superbe Oeuvre"
      />,
    );

    const img = screen.getByAltText("Superbe Oeuvre");
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toContain("photo-test");
  });

  it("falls back to placeholder when image triggers onError", () => {
    render(
      <RankingWorkThumbnail
        imageUrl="https://images.unsplash.com/photo-error"
        title="Oeuvre avec erreur"
      />,
    );

    const img = screen.getByAltText("Oeuvre avec erreur");
    fireEvent.error(img);

    const placeholder = screen.getByRole("img", {
      name: "Aperçu indisponible pour Oeuvre avec erreur",
    });
    expect(placeholder).toBeDefined();
  });

  it("wraps in a link to the work page when workId is provided", () => {
    render(
      <RankingWorkThumbnail
        imageUrl="https://images.unsplash.com/photo-test"
        title="Oeuvre Cliquable"
        workId={42}
      />,
    );

    const link = screen.getByRole("link", { hidden: true });
    expect(link.getAttribute("href")).toBe("/works/42");
  });
});
