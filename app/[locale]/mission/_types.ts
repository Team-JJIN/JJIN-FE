/**
 * 미션 도메인 UI 타입. 서버 타입은 _api/missions.ts를 재수출.
 */
export type {
  Mission,
  MyPlan,
  FeedPost,
  Paginated,
  CreateMissionInput,
  MissionDifficulty,
  MissionCategory,
  MissionFilter,
  MissionSort,
  FeedTab,
} from "@/app/_api/missions";

import type {
  MissionCategory,
  MissionDifficulty,
  MissionSort,
} from "@/app/_api/missions";

// 검색 필터 상태 (검색 오버레이 UI 전용)
export interface SearchFilterState {
  query: string;
  categories: MissionCategory[];
  difficulty: MissionDifficulty | null;
  sort: MissionSort;
}
