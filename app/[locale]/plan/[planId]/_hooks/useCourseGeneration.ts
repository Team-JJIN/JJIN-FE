/**
 * @hook useCourseGeneration
 * AI 코스 생성 라우트(/plan/[planId]/course)의 상태 머신.
 * 마운트 시 코스 생성 API를 1회 실행하고 phase를 반환한다.
 *
 * - loading: 생성 진행 중
 * - success: 코스가 저장됨(생성 성공 or 응답은 실패했지만 저장이 확인됨)
 * - failed:  생성 실패 + 저장된 코스도 없음. errorKind로 문구를 구분한다
 *
 * 화면 전환은 React Query mutation 콜백/상태에 의존하지 않고 여기서 generateCourse를
 * 직접 await 해 결정한다. (mutate 인라인 콜백은 리렌더/언마운트 타이밍에 유실될 수 있어,
 * 201 응답이 와도 상태가 반영되지 않는 문제가 있었다.)
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { ApiError } from "@/app/_api/client";
import {
  generateCourse,
  fetchPlanCourse,
  toPlanApiLocale,
} from "@/app/_api/plans";
import { planKeys } from "../../_hooks/usePlanQueries";
import type { CoursePhase } from "../../_types";

const isDev = process.env.NODE_ENV !== "production";

export function useCourseGeneration(planId: string): CoursePhase {
  const uiLocale = useLocale();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<CoursePhase>({ status: "loading" });

  // 마운트 시 1회만 실행 (StrictMode 이중 마운트 중복 방지).
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const apiLocale = toPlanApiLocale(uiLocale);

    // 코스가 저장됐으면 상세 캐시를 무효화(다음 조회 시 새 코스)한 뒤 성공으로 전환.
    const goSuccess = async () => {
      await queryClient.invalidateQueries({
        queryKey: [...planKeys.all, "detail", planId],
        refetchType: "none",
      });
      setPhase({ status: "success" });
    };

    void (async () => {
      try {
        await generateCourse(planId, apiLocale);
        await goSuccess();
      } catch (err) {
        const status = err instanceof ApiError ? err.status : undefined;
        if (isDev) {
          if (err instanceof ApiError) {
            console.error("[코스 생성 실패]", {
              status: err.status,
              message: err.message,
              detail: err.detail ?? "(detail 없음)",
            });
          } else {
            console.error("[코스 생성 실패] 알 수 없는 오류", err);
          }
        }

        // 생성 응답이 실패(예: 500)여도 서버가 코스를 이미 저장했을 수 있다.
        // 1일차 코스를 조회해 실제 데이터가 있으면 성공으로 처리한다.
        try {
          const day = await fetchPlanCourse(planId, 0, apiLocale);
          if (day.places.length > 0) {
            await goSuccess();
            return;
          }
        } catch (probeErr) {
          if (isDev) console.error("[코스 존재 확인 실패]", probeErr);
        }

        setPhase({
          status: "failed",
          errorKind: status === 422 ? "insufficient" : "generic",
        });
      }
    })();
  }, [planId, uiLocale, queryClient]);

  return phase;
}
