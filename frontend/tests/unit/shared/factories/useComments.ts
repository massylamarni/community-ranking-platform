import { useComments } from "@/hooks/use-comments";

type UseCommentsReturn = ReturnType<typeof useComments>;

export function buildUseComments(
  overrides: Partial<UseCommentsReturn> = {},
): UseCommentsReturn {
  return {
    commentPage: null,
    loading: false,
    error: null,
    list: jest.fn().mockResolvedValue(null),
    refresh: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    ...overrides,
  };
}
