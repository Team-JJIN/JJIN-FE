/**
 * 일정 상세 도메인 UI 타입. 서버 타입은 _api/plans.ts를 재수출.
 */
export type {
  Plan,
  PlanPlace,
  PlanDay,
  PlanDetail,
  PlaceSearchResult,
  OpenHours,
} from "@/app/_api/plans";

/** 장소 카드가 그려지는 맥락 (읽기 전용 / 편집 중 / 검색 결과에서 선택됨) */
export type PlaceCardVariant = "read" | "edit" | "selected";

/** AI 코스 생성 실패 사유. 422(취향/후보 부족) → insufficient, 그 외 → generic */
export type CourseErrorKind = "insufficient" | "generic";

/** AI 코스 생성 라우트의 화면 단계 */
export type CoursePhase =
  | { status: "loading" }
  | { status: "success" }
  | { status: "failed"; errorKind: CourseErrorKind };
