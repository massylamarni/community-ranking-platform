/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { useQuery } from "@/hooks/use-query";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("useQuery", () => {
  it("ignores stale requests and supports updating settled data", async () => {
    const oldRequest = deferred<string>();
    const currentRequest = deferred<string>();
    const oldFetcher = () => oldRequest.promise;
    const currentFetcher = () => currentRequest.promise;
    const { result, rerender } = renderHook(
      ({ fetcher }) => useQuery(fetcher),
      { initialProps: { fetcher: oldFetcher } },
    );

    rerender({ fetcher: currentFetcher });
    await act(async () => {
      currentRequest.resolve("current");
      await currentRequest.promise;
    });

    await act(async () => {
      oldRequest.resolve("stale");
      await oldRequest.promise;
    });

    expect(result.current.data).toBe("current");
    expect(result.current.loading).toBe(false);

    act(() => result.current.setData((previous) => `${previous} updated`));
    expect(result.current.data).toBe("current updated");
  });
});
