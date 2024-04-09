/* eslint-disable */
import { act, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { vi } from "vitest";
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

describe("useThrottled", () => {
  beforeEach(() => {
    vi.clearAllTimers();
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
});
