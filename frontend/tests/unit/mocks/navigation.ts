export const mockUseParams = jest.fn();
export const mockPush = jest.fn();

export const mockReplace = jest.fn();
const router = { push: mockPush, replace: mockReplace };

export const navigationModule = {
  useParams: () => mockUseParams(),
  useRouter: () => router,
};

export function mockRouteParams(params: Record<string, string>) {
  mockUseParams.mockReturnValue(params);
}
