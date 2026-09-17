/**
 * @component QueryProvider
 * TanStack Query 클라이언트 프로바이더. 컴포넌트별 QueryClient 재생성 방지를 위해 useState로 보관.
 */
"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { restoreSession } from "@/app/_api/client";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // accessToken은 메모리 보관이라 새로고침 시 사라진다. 앱 시작 시 refreshToken으로 1회 복구 시도.
  useEffect(() => {
    restoreSession();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
