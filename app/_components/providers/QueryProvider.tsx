/**
 * @component QueryProvider
 * TanStack Query 클라이언트 프로바이더. 컴포넌트별 QueryClient 재생성 방지를 위해 useState로 보관.
 *
 * accessToken은 메모리 보관이라 새로고침 시 사라진다. 앱 시작 시 refreshToken으로 세션을 1회 복구하는데,
 * 복구가 끝나기 전에 인증이 필요한 쿼리(usePlans 등)가 토큰 없이 실행되면 빈 목록/실패가 뜬다.
 * 따라서 복구가 완료될 때까지 children 렌더를 보류한다(복구는 보통 수십~수백 ms로 끝난다).
 */
"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { restoreSession } from "@/app/_api/client";
import ScreenPreparation from "@/app/_components/loading/ScreenPreparation";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 세션 복구 완료 여부. 완료 전에는 인증 쿼리가 실행되지 않도록 children을 렌더하지 않는다.
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    restoreSession().finally(() => {
      if (mounted) setSessionReady(true);
    });
    return () => {
      mounted = false;
    };
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
    <QueryClientProvider client={queryClient}>
      {sessionReady ? children : <ScreenPreparation className="h-dvh" />}
    </QueryClientProvider>
  );
}
