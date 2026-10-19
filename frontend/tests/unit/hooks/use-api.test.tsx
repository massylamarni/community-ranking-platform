/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { ApiError } from "@/lib/errors";
import { useApi } from "@/hooks/use-api";

describe("useApi", () => {
  it("returns the result and clears loading after success", async () => {
    const { result } = renderHook(() => useApi());
    let outcome: Awaited<ReturnType<typeof result.current.run>> | undefined;

    await act(async () => {
      outcome = await result.current.run(
        Promise.resolve("saved"),
        { success: "Saved", error: "Save failed" },
      );
    });

    expect(outcome).toEqual({ ok: true, data: "saved" });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns a failure result and stores the error after rejection", async () => {
    const error = new ApiError({ status: 422, error: "Invalid input" });
    const { result } = renderHook(() => useApi());
    let outcome: Awaited<ReturnType<typeof result.current.run>> | undefined;

    await act(async () => {
      outcome = await result.current.run(
        Promise.reject(error),
        { error: "Save failed" },
      );
    });

    expect(outcome).toEqual({ ok: false });
    expect(result.current.error).toBe(error);
    expect(result.current.loading).toBe(false);
  });
});
