import { useEffect, useRef, useState } from "react";
import { DEFAULT_THROTTLE_DELAY } from "../constants";

export const useThrottled = <T>(value: T, delay = DEFAULT_THROTTLE_DELAY) => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdatedTime = useRef<ReturnType<typeof Date.now>>(Date.now());

  function getTimeRemaining(throttleDelay: number) {
    const elapsedTime = Date.now() - lastUpdatedTime.current;
    return elapsedTime < throttleDelay ? throttleDelay - elapsedTime : 0;
  }

  useEffect(() => {
    const timeRemaining = getTimeRemaining(delay);

    if (timeRemaining === 0) {
      setThrottledValue(value);
      lastUpdatedTime.current = Date.now();
      return;
    }

    const timeout = setTimeout(() => {
      setThrottledValue(value);
      lastUpdatedTime.current = Date.now();
    }, timeRemaining);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]);

  return throttledValue;
};
