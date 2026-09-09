/**
 * 일정 상세 도메인 UI 타입. 서버 타입은 _api/plans.ts를 재수출.
 */
export type {
  Plan,
  PlanPlace,
  PlanDay,
  PlanDetail,
  PlaceSearchResult,
  PlaceSort,
  OpenHours,
} from "@/app/_api/plans";

/** 장소 카드가 그려지는 맥락 (읽기 전용 / 편집 중 / 검색 결과에서 선택됨) */
export type PlaceCardVariant = "read" | "edit" | "selected";
