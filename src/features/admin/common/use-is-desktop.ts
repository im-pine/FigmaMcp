"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 1024px)";

/** lg(1024px) 이상이면 true. 데스크톱은 Dialog · 메뉴, 모바일은 하단 시트로 나눌 때 쓴다. 서버 렌더에서는 false */
export function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
