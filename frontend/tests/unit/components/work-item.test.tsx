/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkItem } from "@/app/works/_components/workItem";
import { buildVoteResponse } from "@/tests/unit/shared/factories/voteResponse";
import { buildWork } from "@/tests/unit/shared/factories/work";
import { mockUseAuth } from "@/tests/unit/shared/mocks/useAuth";
import { mockVote } from "@/tests/unit/shared/mocks/votesRepository";

jest.mock("@/hooks/use-auth", () => ({ useAuth: () => mockUseAuth() }));
jest.mock("@/repositories", () => ({
  votesRepository: {
    vote: (...args: Parameters<typeof mockVote>) => mockVote(...args),
  },
}));
jest.mock("@/app/comments/_components/commentSection", () => ({
  CommentSection: () => null,
}));

describe("WorkItem", () => {
  describe("vote display", () => {
    it("derives upvote and downvote counts from score and totalVotes", () => {
      render(<WorkItem work={buildWork({ totalVotes: 10, score: 4 })} />);

      expect(screen.getByRole("button", { name: "Upvote" }).textContent).toBe(
        "7",
      );
      expect(screen.getByRole("button", { name: "Downvote" }).textContent).toBe(
        "3",
      );
    });

    it("shows a plain vote total instead of vote buttons when score is undefined", () => {
      render(
        <WorkItem work={buildWork({ score: undefined, totalVotes: 5 })} />,
      );

      expect(screen.getByText("5 vote(s)")).not.toBeNull();
      expect(screen.queryByRole("button", { name: "Upvote" })).toBeNull();
      expect(screen.queryByRole("button", { name: "Downvote" })).toBeNull();
    });

    it("disables the vote buttons when setWork is not provided", () => {
      render(<WorkItem work={buildWork({ totalVotes: 10, score: 4 })} />);

      const up = screen.getByRole("button", {
        name: "Upvote",
      }) as HTMLButtonElement;
      const down = screen.getByRole("button", {
        name: "Downvote",
      }) as HTMLButtonElement;

      expect(up.disabled).toBe(true);
      expect(down.disabled).toBe(true);
    });
  });

  describe("voting", () => {
    it.each([
      ["Upvote", 1],
      ["Downvote", -1],
    ] as const)(
      "%s sends value %i and passes the returned work to setWork",
      async (label, value) => {
        const work = buildWork({ totalVotes: 10, score: 4 });
        const updatedWork = buildWork({ totalVotes: 11, score: 5 });
        mockVote.mockResolvedValue(buildVoteResponse(updatedWork, value));
        const setWork = jest.fn();

        render(<WorkItem work={work} setWork={setWork} />);
        await userEvent.click(screen.getByRole("button", { name: label }));

        await waitFor(() => expect(setWork).toHaveBeenCalledWith(updatedWork));
        expect(mockVote).toHaveBeenCalledWith(work.id, { value });
      },
    );

    it("sends value null when clicking the same vote a second time (toggle off)", async () => {
      const work = buildWork({ totalVotes: 10, score: 4 });
      mockVote.mockResolvedValue(buildVoteResponse(work, 1));
      const setWork = jest.fn();

      render(<WorkItem work={work} setWork={setWork} />);
      const upvote = screen.getByRole("button", { name: "Upvote" });

      await userEvent.click(upvote);
      await waitFor(() => expect(setWork).toHaveBeenCalledTimes(1));

      await userEvent.click(upvote);
      await waitFor(() => expect(mockVote).toHaveBeenCalledTimes(2));

      expect(mockVote).toHaveBeenNthCalledWith(1, work.id, { value: 1 });
      expect(mockVote).toHaveBeenNthCalledWith(2, work.id, { value: null });
    });
  });
});
