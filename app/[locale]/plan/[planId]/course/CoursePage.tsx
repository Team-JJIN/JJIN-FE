/**
 * @component CoursePage
 * AI 코스 생성 결과 라우트(/plan/[planId]/course).
 * 생성 상태 머신은 useCourseGeneration이 담당하고, 이 컴포넌트는 phase에 따라 뷰만 고른다.
 *  - loading: B-2 로딩 화면
 *  - success: 로딩 화면을 '완료' 상태로 전환(로고 정지 + "코스 생성 완료" + 완료 토스트)한 뒤
 *             3초 후 일정 상세로 자동 복귀. 별도 결과 화면은 없다.
 *  - failed:  실패 화면(자동 복귀 없이 '<' 뒤로가기로만 이전 화면 복귀)
 */
"use client";

import { useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { useCourseGeneration } from "../_hooks/useCourseGeneration";
import CourseLoading from "../_components/CourseLoading";
import CourseError from "../_components/CourseError";

// 완료 안내를 보여준 뒤 일정 상세로 자동 복귀하기까지의 지연(ms).
const DONE_AUTO_BACK_MS = 3000;

export default function CoursePage() {
  const { planId } = useParams<{ planId: string }>();
  const router = useRouter();
  const locale = useLocale();

  const phase = useCourseGeneration(planId);

  const goBack = useCallback(
    () => router.replace(`/${locale}/plan/${planId}`),
    [router, locale, planId],
  );

  // 생성 완료 → 완료 안내를 3초 노출한 뒤 일정 상세로 자동 복귀.
  useEffect(() => {
    if (phase.status !== "success") return;
    const timer = setTimeout(goBack, DONE_AUTO_BACK_MS);
    return () => clearTimeout(timer);
  }, [phase.status, goBack]);

  if (phase.status === "failed") {
    return <CourseError errorKind={phase.errorKind} onBack={goBack} />;
  }

  // loading / success 모두 로딩 화면을 재사용 (success면 done 모드로 완료 표시)
  return <CourseLoading done={phase.status === "success"} />;
}
