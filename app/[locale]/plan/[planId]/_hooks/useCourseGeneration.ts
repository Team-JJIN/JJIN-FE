/**
 * @hook useCourseGeneration
 * AI 코스 생성 라우트(/plan/[planId]/course)의 상태 머신.
 * 마운트 시 코스 생성 API를 실행하고 phase를 반환한다.
 *
 * - loading: 생성 진행 중
 * - success: 코스가 저장됨(생성 성공 or 응답 실패 후 코스 존재 확인으로 통과)
 * - failed:  생성 실패 + 저장된 코스도 없음. errorKind로 문구를 구분한다
 *
 * 재시도 전략
 *   네트워크 단절(status 0) 또는 게이트웨이 타임아웃(status 504)은 서버가 실제로는
 *   처리 중일 가능성이 있다. 이 경우 최대 MAX_RETRIES회 재시도한다.
 *   재시도 간격은 지수 백오프(2s → 4s)를 적용해 서버 부하를 줄인다.
 *   422(장소 데이터 부족)나 401(인증 만료) 같은 의미 있는 오류는 재시도하지 않는다.
 *
 * 보정 로직
 *   생성 응답이 실패여도 서버가 코스를 이미 저장했을 수 있다.
 *   1일차 코스를 조회해 실제 데이터가 있으면 성공으로 처리한다.
 *
 * 화면 전환은 React Query mutation 콜백/상태에 의존하지 않고 generateCourse를
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

/** 재시도 최대 횟수 (초기 시도 제외) */
const MAX_RETRIES = 3;
/**
 * 재시도 기본 대기 시간 (ms). 지수 백오프 적용.
 * 504는 서버가 응답을 끊은 것이므로 빠르게 재시도하는 게 유리하다.
 * attempt 1 → 500ms, attempt 2 → 1s, attempt 3 → 2s
 */
const RETRY_BASE_DELAY_MS = 500;

/** 재시도해야 하는 오류인지 판단. 네트워크 단절(0)과 게이트웨이 타임아웃(504)만 재시도한다. */
function isRetryableError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  return err.status === 0 || err.status === 504;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useCourseGeneration(planId: string): CoursePhase {
  const uiLocale = useLocale();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<CoursePhase>({ status: "loading" });

  // 마운트 시 1회만 실행 (StrictMode 이중 마운트 중복 방지)
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const apiLocale = toPlanApiLocale(uiLocale);

    // 코스가 저장됐으면 상세 캐시를 무효화(다음 조회 시 새 코스)한 뒤 성공으로 전환
    const goSuccess = async () => {
      await queryClient.invalidateQueries({
        queryKey: [...planKeys.all, "detail", planId],
        refetchType: "none",
      });
      setPhase({ status: "success" });
    };

    // 코스 생성 API 호출 (재시도 포함)
    const runGenerate = async (): Promise<void> => {
      let lastErr: unknown;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          const waitMs = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          if (isDev) console.warn(`[코스 생성] 재시도 ${attempt}/${MAX_RETRIES} (${waitMs}ms 대기)`);
          await delay(waitMs);
        }

        try {
          await generateCourse(planId, apiLocale);
          await goSuccess();
          return; // 성공 → 즉시 종료
        } catch (err) {
          lastErr = err;

          if (isDev) {
            const info = err instanceof ApiError
              ? { status: err.status, message: err.message, detail: err.detail ?? "(detail 없음)" }
              : err;
            console.error(`[코스 생성 실패] attempt ${attempt}`, info);
          }

          // 재시도 불필요한 오류(422, 401 등)는 즉시 중단
          if (!isRetryableError(err)) break;
        }
      }

      // 모든 시도 실패 — 서버가 이미 코스를 저장했을 수 있으므로 1일차 존재 여부로 보정
      try {
        const day = await fetchPlanCourse(planId, 0, apiLocale);
        if (day.places.length > 0) {
          await goSuccess();
          return;
        }
      } catch (probeErr) {
        if (isDev) console.error("[코스 존재 확인 실패]", probeErr);
      }

      const status = lastErr instanceof ApiError ? lastErr.status : undefined;
      setPhase({
        status: "failed",
        errorKind: status === 422 ? "insufficient" : "generic",
      });
    };

    void runGenerate();
  }, [planId, uiLocale, queryClient]);

  return phase;
}
