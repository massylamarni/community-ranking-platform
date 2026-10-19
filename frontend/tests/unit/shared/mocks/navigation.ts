export const mockUseParams = jest.fn();
export const mockUseSearchParams = jest.fn(
  () => new URLSearchParams(),
);
export const mockPush = jest.fn();

export const mockReplace = jest.fn();
const router = { push: mockPush, replace: mockReplace };

export const navigationModule = {
  useParams: () => mockUseParams(),
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => router,
};

export function mockRouteParams(params: Record<string, string>) {
  mockUseParams.mockReturnValue(params);
}

export function mockSearchParams(params: Record<string, string>) {
  mockUseSearchParams.mockReturnValue(new URLSearchParams(params));
}
