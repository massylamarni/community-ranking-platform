import type { Work } from "@/types/api";

export const mockUseWorks = jest.fn();

export const workActions = {
  get: jest.fn(),
  submit: jest.fn(),
  update: jest.fn(),
  uploadImage: jest.fn(),
  remove: jest.fn(),
  list: jest.fn(),
};

export const useWorksModule = { useWorks: () => mockUseWorks() };

export function mockWorksState(work: Work | null) {
  mockUseWorks.mockReturnValue({ work, ...workActions });
}

export function mockWorksList(
  works: Work[],
  overrides: { loading?: boolean; error?: { message: string } | null } = {},
) {
  mockUseWorks.mockReturnValue({
    works,
    loading: false,
    error: null,
    ...overrides,
    ...workActions,
  });
}
