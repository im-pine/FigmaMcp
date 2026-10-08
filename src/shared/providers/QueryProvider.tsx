"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/** TanStack Query — 서버 상태 캐시. staleTime을 둬 서버에서 받은 첫 데이터를 바로 다시 요청하지 않는다. */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
