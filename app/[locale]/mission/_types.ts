/**
 * 미션 도메인 UI 타입. 서버 타입은 _api/missions.ts·_api/feed.ts를 재수출.
 */
export type {
  Mission,
  MyPlan,
  Paginated,
  CreateMissionInput,
  MissionDifficulty,
  MissionCategory,
  MissionFilter,
  MissionSort,
} from "@/app/_api/missions";

export type {
  FeedPost,
  FeedTab,
  FeedComment,
  FeedMission,
} from "@/app/_api/feed";

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
