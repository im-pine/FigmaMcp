"use client";

import { useSyncExternalStore } from "react";

/** CSS 미디어 쿼리 일치 여부. 서버 렌더에서는 false. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
