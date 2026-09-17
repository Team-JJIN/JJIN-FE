/**
 * @hook useDebouncedValue
 * value가 delayMs 동안 바뀌지 않고 유지되면 그 값을 반환한다. 검색어 입력 디바운스에 쓴다.
 */
"use client";

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
