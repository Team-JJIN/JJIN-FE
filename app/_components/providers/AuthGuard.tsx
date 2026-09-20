"use client";

/**
 * @component AuthGuard
 * 클라이언트 래퍼. [locale]/layout(서버 컴포넌트)에서 직접 훅을 쓸 수 없으므로
 * 이 컴포넌트를 통해 useAuthExpired 훅을 마운트한다.
 *
 * - auth:expired 이벤트 수신 시 /{locale}/auth로 replace
 * - usePathname을 사용하는 useAuthExpired가 Suspense 경계 안에서 동작해야 하므로
 *   Suspense로 감싼다 (Next.js App Router에서 useSearchParams/usePathname 요구사항)
 */

import { memo, Suspense } from "react";
import { useAuthExpired } from "@/app/_components/hooks/useAuthExpired";
import ScreenPreparation from "@/app/_components/loading/ScreenPreparation";

function AuthGuardInner({ children }: { children: React.ReactNode }) {
  useAuthExpired();
  return <>{children}</>;
}

// children이 바뀌지 않는 한 리렌더하지 않도록 memo 적용
const AuthGuard = memo(function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<ScreenPreparation className="h-dvh" />}>
      <AuthGuardInner>{children}</AuthGuardInner>
    </Suspense>
  );
});

export default AuthGuard;
