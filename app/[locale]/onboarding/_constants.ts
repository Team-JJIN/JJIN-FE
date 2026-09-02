import type { Transport, Category, Level } from "./_types";

// 인기 여행지 (검색어가 없을 때 노출). 값은 서버 지역 검색 displayName과 동일한 한국어 표시명.
export const POPULAR_REGIONS = [
  "서울", "부산", "인천", "제주", "전주", "경주",
  "강릉", "속초", "대구", "광주", "여수", "춘천",
] as const;

// 이동 수단
export const TRANSPORTS: Transport[] = ["walking", "publicTransit", "car"];

// 대분류
export const CATEGORIES: Category[] = [
  "food", "experience", "nature", "history",
  "culture", "shopping", "festival", "leisure",
];

// 중분류 — 키 기반 (i18n으로 번역)
export const SUB_CATEGORIES: Record<string, string[]> = {
  food: ["korean", "cafe", "bar", "allFood"],
  experience: ["traditional", "temple", "unique"],
  nature: ["mountain", "beach", "lake", "island", "park"],
  history: ["palace", "ruins", "museum", "village"],
  culture: ["gallery", "performance", "streetArt", "buddhistTemple"],
  shopping: ["traditionalMarket", "localShop", "dutyFree", "vintage"],
  festival: ["festival", "event", "fireworks", "nightMarket"],
  leisure: ["surfing", "skiing", "hiking", "cycling", "waterSports"],
};

export const LEVELS: Level[] = ["light", "normal", "deep"];
