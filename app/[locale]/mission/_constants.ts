import type { MissionCategory, MissionDifficulty } from "@/app/_api/missions";

// 미션 필터 탭
export const MISSION_FILTERS = ["all", "mustDo", "hot", "mine"] as const;

// 미션 대분류 — onboarding.categories와 동일 키 체계
export const MISSION_CATEGORIES: MissionCategory[] = [
  "food",
  "experience",
  "nature",
  "history",
  "culture",
  "shopping",
  "festival",
  "leisure",
];

// 정렬 옵션
export const SORT_OPTIONS = ["popular", "latest"] as const;

// 피드 탭
export const FEED_TABS = ["latest", "popular", "weeklyHot"] as const;

// 난이도
export const DIFFICULTIES: MissionDifficulty[] = [1, 2, 3];

// 미션 생성 시 추천 해시태그
// 생성 폼 프리셋 칩 라벨용 i18n 키(mission.hashtags.*) — 제출 시에는 t()로 변환된 표시 문자열이 저장됨
export const DEFAULT_HASHTAGS = [
  "cafeTour",
  "foodTour",
  "photoSpot",
  "local",
  "challenge",
] as const;

export const TITLE_MAX = 30;
export const DESC_MAX = 150;
