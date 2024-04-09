/* eslint-disable */
import { act, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { type Mock, vi } from "vitest";
import { DEFAULT_THROTTLE_DELAY } from "../../../src/constants";
import { useThrottled } from "../../../src/hooks/useThrottled";

function MockComponentWithThrottledHook({
  delay = DEFAULT_THROTTLE_DELAY,
}: {
  delay?: number;
}) {
  const [counter, setCounter] = useState<number>(0);
  const throttledValue = useThrottled(counter, delay);

  return (
    <>
      <p data-testid="throttled-value">{throttledValue}</p>
      <button
        data-testid="btn-increment-counter"
        onClick={() => setCounter((prevCounter) => prevCounter + 1)}
      >
        Increment counter
      </button>
    </>
  );
}

vi.useFakeTimers();
vi.spyOn(global, "setTimeout");
vi.spyOn(global, "clearTimeout");

describe("useThrottled", () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it("should return updated throttled value when timeout is finished", () => {
    const wrapper = render(<MockComponentWithThrottledHook delay={3000} />);
    const buttonIncrementCounter = wrapper.getByTestId("btn-increment-counter");

    expect(wrapper.getByTestId("throttled-value").innerText).toBe("0");
    vi.advanceTimersByTime(1000);
    fireEvent.click(buttonIncrementCounter);
    vi.advanceTimersByTime(1000);
    expect(wrapper.getByTestId("throttled-value").innerText).toBe("0");
    fireEvent.click(buttonIncrementCounter);
    act(() => vi.advanceTimersByTime(1000));
    expect(wrapper.getByTestId("throttled-value").innerText).toBe("2");
  });

  it("should setTimeout be called with correct time remaining when timeout has previously already started", () => {
    const wrapper = render(<MockComponentWithThrottledHook delay={2500} />);
    const buttonIncrementCounter = wrapper.getByTestId("btn-increment-counter");

    expect(setTimeout as unknown as Mock).toHaveBeenCalledTimes(1);
    expect(setTimeout as unknown as Mock).toHaveBeenCalledWith(
      expect.any(Function),
      2500
    );
    vi.advanceTimersByTime(1300);
    fireEvent.click(buttonIncrementCounter);
    expect(clearTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout as unknown as Mock).toHaveBeenCalledTimes(2);
    expect(setTimeout as unknown as Mock).toHaveBeenCalledWith(
      expect.any(Function),
      1200
    );
  });
});
