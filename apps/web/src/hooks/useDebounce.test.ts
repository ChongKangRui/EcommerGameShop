import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("does not update before the delay has passed", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "first" } },
    );

    rerender({ value: "second" });
    expect(result.current).toBe("first"); // hasn't caught up yet

    act(() => {
      vi.advanceTimersByTime(200); // less than the 300ms delay
    });
    expect(result.current).toBe("first");
  });

  it("updates after the delay has passed", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "first" } },
    );

    rerender({ value: "second" });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("second");
  });

  it("resets the timer on rapid consecutive changes, so only the final value commits", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "abc" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "abcd" });
    act(() => {
      vi.advanceTimersByTime(100);
    }); // only 100ms since last change

    expect(result.current).toBe("a"); // none of the intermediate values ever committed

    act(() => {
      vi.advanceTimersByTime(200);
    }); // now 300ms since 'abcd'
    expect(result.current).toBe("abcd");
  });
});
