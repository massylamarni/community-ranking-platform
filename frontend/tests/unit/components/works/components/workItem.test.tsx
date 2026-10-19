/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkItem } from "@/app/works/_components/workItem";
import { buildUseApi } from "@/tests/unit/shared/factories/useApi";
import { buildVoteResponse } from "@/tests/unit/shared/factories/voteResponse";
import { buildWork } from "@/tests/unit/shared/factories/work";
import { mockUseAuth } from "@/tests/unit/shared/mocks/hooks/use-auth";

const mockVote = jest.fn();
const mockRun = jest.fn();
const mockApiValue = buildUseApi({ run: mockRun, loading: true });

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));
jest.mock("@/hooks", () => ({
  useApi: () => mockApiValue,
}));
jest.mock("@/repositories", () => ({
  votesRepository: {
    vote: (...args: unknown[]) => mockVote(...args),
  },
}));
jest.mock("@/app/comments/_components/commentSection", () => ({
  CommentSection: () => <div>Comment section</div>,
}));

describe("WorkItem voting", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 2, username: "bob", email: "bob@example.com", role: "user" },
    });
    mockVote.mockReset();
  });

  it("submits the selected vote, updates the work, and sends null to remove the same vote", async () => {
    const work = buildWork({ id: 12 });
    const updatedWork = buildWork({ id: 12, score: 1, totalVotes: 1 });
    const setWork = jest.fn();
    mockRun.mockResolvedValue({
      ok: true,
      data: buildVoteResponse(updatedWork, 1),
    });
    mockVote.mockResolvedValue(buildVoteResponse(updatedWork, 1));
    render(<WorkItem work={work} setWork={setWork} showComments={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Upvote" }));
    expect(mockVote).toHaveBeenLastCalledWith(12, { value: 1 });
    expect(setWork).toHaveBeenLastCalledWith(updatedWork);

    await userEvent.click(screen.getByRole("button", { name: "Upvote" }));
    expect(mockVote).toHaveBeenLastCalledWith(12, { value: null });
  });
});
