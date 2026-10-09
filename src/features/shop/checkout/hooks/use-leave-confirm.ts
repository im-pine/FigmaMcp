"use client";

import { useEffect } from "react";

const GUARD_KEY = "__leaveConfirm";

/**
 * 브라우저 뒤로 가기를 누르면 나갈지 먼저 묻는다 (주문서 · 결제 화면).
 * 현재 주소로 히스토리를 하나 더 쌓아 두고, 뒤로 가기(popstate)가 오면 확인 창을 띄운다.
 * - 취소: 다시 쌓아 화면에 머문다 / 확인: 한 번 더 뒤로 가서 실제로 나간다
 * - 쌓는 상태는 Next.js 라우터 상태(history.state)를 그대로 복사해, 라우터가 같은 화면으로 인식하게 한다
 * - 이미 쌓여 있으면 다시 쌓지 않는다 (개발 모드의 effect 두 번 실행 대비)
 */
export function useLeaveConfirm(message: string) {
  useEffect(() => {
    const guardState = { ...window.history.state, [GUARD_KEY]: true };
    if (!window.history.state?.[GUARD_KEY]) {
      window.history.pushState(guardState, "", window.location.href);
    }

    const onPopState = () => {
      if (window.confirm(message)) {
        window.removeEventListener("popstate", onPopState);
        window.history.back();
      } else {
        window.history.pushState(guardState, "", window.location.href);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [message]);
}
