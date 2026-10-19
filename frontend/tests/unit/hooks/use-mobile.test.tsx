/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

describe("useIsMobile", () => {
  it("updates when the viewport crosses the mobile breakpoint", () => {
    const originalWidth = window.innerWidth;
    const originalMatchMedia = window.matchMedia;
    const listeners: Array<() => void> = [];
    const removeListener = jest.fn();

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 767,
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({
        addEventListener: (_: string, listener: () => void) =>
          listeners.push(listener),
        removeEventListener: removeListener,
      }),
    });

    const { result, unmount } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    act(() => {
      Object.defineProperty(window, "innerWidth", { value: 768 });
      listeners[0]();
    });
    expect(result.current).toBe(false);

    unmount();
    expect(removeListener).toHaveBeenCalledWith("change", listeners[0]);

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalWidth,
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
  });
});
