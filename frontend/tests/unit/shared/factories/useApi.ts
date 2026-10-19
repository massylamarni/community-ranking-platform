import type { useApi } from "@/hooks";

type UseApiReturn = ReturnType<typeof useApi>;

export function buildUseApi(
  overrides: Partial<UseApiReturn> = {},
): UseApiReturn {
  return {
    run: jest.fn().mockResolvedValue({ ok: true, data: undefined }),
    loading: false,
    error: null,
    ...overrides,
  };
}
