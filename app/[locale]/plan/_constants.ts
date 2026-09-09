import type { PlaceSort } from "./_types";

export const PLACE_SORT_OPTIONS = [
  "recent",
  "distance",
  "rating",
] as const satisfies readonly PlaceSort[];

export const DEFAULT_PLACE_SORT: PlaceSort = "distance";

export const RECENT_SEARCH_MAX = 10; // localStorage 저장 상한
export const RECENT_SEARCH_SHOWN = 5; // 칩 표시 수
export const RECENT_SEARCH_KEY = "jjin:plan:recentPlaceSearches";

export const SEARCH_DEBOUNCE_MS = 250;

export const DEFAULT_MAP_CENTER = { lat: 37.4563, lng: 126.7052 } as const; // 인천시청
