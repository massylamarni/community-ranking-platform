/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import type { profilesRepository } from "@/repositories";
import { useProfile } from "@/hooks/use-public-profile";
import type { PublicProfile } from "@/types/api";

type Repository = typeof profilesRepository;

const mockGetPublicProfile = jest.fn<
  ReturnType<Repository["getPublicProfile"]>,
  Parameters<Repository["getPublicProfile"]>
>();

jest.mock("@/repositories", () => ({
  profilesRepository: {
    getPublicProfile: (...args: Parameters<typeof mockGetPublicProfile>) =>
      mockGetPublicProfile(...args),
  },
}));

describe("usePublicProfile", () => {
  it("requests and stores the profile for the requested user", async () => {
    const profile: PublicProfile = {
      userId: 42,
      username: "alice",
      publishedWorks: [],
      comments: [],
      votedWorks: [],
    };
    mockGetPublicProfile.mockResolvedValue(profile);
    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await result.current.getPublicProfile(42);
    });

    expect(mockGetPublicProfile).toHaveBeenCalledWith(42);
    expect(result.current.profile).toEqual(profile);
    expect(result.current.loading).toBe(false);
  });
});
