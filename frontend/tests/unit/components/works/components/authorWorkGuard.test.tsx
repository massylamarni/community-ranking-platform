/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { buildWork } from "@/tests/unit/shared/factories/work";
import { mockUseAuth } from "@/tests/unit/shared/mocks/hooks/use-auth";
import AuthorWorkGuard from "@/app/works/_components/guards/authorWorkGuard";

const mockUseWorks = jest.fn();

jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));
jest.mock("@/hooks/use-work", () => ({
  useWorks: () => mockUseWorks(),
}));

describe("AuthorWorkGuard", () => {
  beforeEach(() => {
    mockUseWorks.mockReturnValue({
      work: buildWork({ id: 5 }),
      get: jest.fn().mockResolvedValue(buildWork({ id: 5 })),
    });
  });

  it("renders the protected content for the work's author", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 2, username: "alice", email: "alice@example.com", role: "user" },
    });
    render(
      <AuthorWorkGuard id={5}>
        {(work) => <div>Editing {work.title}</div>}
      </AuthorWorkGuard>,
    );

    expect(await screen.findByText("Editing Test work")).not.toBeNull();
  });

  it("denies protected content to a different user", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 3, username: "bob", email: "bob@example.com", role: "user" },
    });
    render(
      <AuthorWorkGuard id={5}>
        {() => <div>Protected editor</div>}
      </AuthorWorkGuard>,
    );

    expect(await screen.findByText("Vous ne pouvez pas modifier cette œuvre")).not.toBeNull();
    expect(screen.queryByText("Protected editor")).toBeNull();
  });
});
