/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WorkItem } from "@/app/works/_components/workItem";
import { votesRepository } from "@/repositories";
import type { VoteForWorkReponse, Work } from "@/types/api";
import { describe, expect, it, beforeEach } from "@jest/globals";
import { createWork } from "../shared/utils";

jest.mock("@/app/works/_components/guards/workNotFoundGuard", () => ({
  __esModule: true,
  default: () => <div data-testid="not-found-guard" />,
}));

jest.mock("@/repositories", () => ({
  votesRepository: { vote: jest.fn() },
}));

const voteMock = jest.mocked(votesRepository.vote);

function votableWork(value: 1 | -1 | null): VoteForWorkReponse {
  return {
    id: "26",
    userId: "2",
    value: value ?? 1,
    createdAt: "2026-10-13T11:16:35.608248623",
    oeuvre: {
      ...createWork(),
      score: value ?? 0,
      totalVotes: value === null ? 0 : 1,
    },
  };
}

function voteButtons() {
  const [up, down] = screen.getAllByRole("button");
  return { up, down };
}

describe("WorkItem", () => {
  it("renders the work and reports when it is selected", () => {
    const work: Work = createWork();
    const setSelectedWork = jest.fn();

    render(<WorkItem work={work} setSelectedWork={setSelectedWork} />);

    expect(screen.getByText(work.title)).toBeDefined();
    expect(screen.getByText(work.description)).toBeDefined();
    expect(screen.getByText(work.author)).toBeDefined();

    fireEvent.click(screen.getByText(work.title));

    expect(setSelectedWork).toHaveBeenCalledWith(work);
  });

  it("renders the not-found guard when work is null", () => {
    render(<WorkItem work={null} />);

    expect(screen.getByTestId("not-found-guard")).toBeDefined();
  });

  describe("voting", () => {
    beforeEach(() => {
      voteMock.mockReset();
    });

    it("sends the clicked value and updates the work", async () => {
      const voteReponse = votableWork(null);
      const updated = votableWork(1);
      const setWork = jest.fn();
      voteMock.mockResolvedValue(updated);

      render(<WorkItem work={voteReponse.oeuvre} setWork={setWork} />);
      fireEvent.click(voteButtons().up);

      await waitFor(() => expect(setWork).toHaveBeenCalledWith(updated.oeuvre));
      expect(voteMock).toHaveBeenCalledWith(voteReponse.oeuvre.id, {
        value: 1,
      });
    });

    it("sends null when the active vote is clicked again", async () => {
      const work = votableWork(null).oeuvre;
      const setWork = jest.fn();
      voteMock
        .mockResolvedValueOnce(votableWork(1))
        .mockResolvedValueOnce(votableWork(null));

      render(<WorkItem work={work} setWork={setWork} />);

      fireEvent.click(voteButtons().up);
      await waitFor(() => expect(setWork).toHaveBeenCalledTimes(1));

      fireEvent.click(voteButtons().up);
      await waitFor(() => expect(setWork).toHaveBeenCalledTimes(2));

      expect(voteMock).toHaveBeenNthCalledWith(1, work.id, { value: 1 });
      expect(voteMock).toHaveBeenNthCalledWith(2, work.id, { value: null });
    });

    it("switches the vote when the opposite button is clicked", async () => {
      const work = votableWork(null).oeuvre;
      const setWork = jest.fn();
      voteMock
        .mockResolvedValueOnce(votableWork(1))
        .mockResolvedValueOnce(votableWork(-1));

      render(<WorkItem work={work} setWork={setWork} />);

      fireEvent.click(voteButtons().up);
      await waitFor(() => expect(setWork).toHaveBeenCalledTimes(1));

      fireEvent.click(voteButtons().down);
      await waitFor(() => expect(setWork).toHaveBeenCalledTimes(2));

      expect(voteMock).toHaveBeenNthCalledWith(1, work.id, { value: 1 });
      expect(voteMock).toHaveBeenNthCalledWith(2, work.id, { value: -1 });
    });

    it("does not update the work when the request fails", async () => {
      const setWork = jest.fn();
      voteMock.mockRejectedValue({ message: "Forbidden" });

      render(<WorkItem work={votableWork(null).oeuvre} setWork={setWork} />);
      fireEvent.click(voteButtons().up);

      await waitFor(() => expect(voteMock).toHaveBeenCalled());
      expect(setWork).not.toHaveBeenCalled();
    });

    it("disables the vote buttons when setWork is not provided", () => {
      render(<WorkItem work={votableWork(null).oeuvre} />);

      const { up, down } = voteButtons();
      expect((up as HTMLButtonElement).disabled).toBe(true);
      expect((down as HTMLButtonElement).disabled).toBe(true);
    });
  });
});
