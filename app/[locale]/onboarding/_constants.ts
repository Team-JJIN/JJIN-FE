import type { Transport, Category, Level } from "./_types";

// 지역 키 (i18n 키와 매핑)
export const REGIONS = [
  "seoul", "busan", "incheon", "jeju", "jeonju", "gyeongju",
  "gangneung", "sokcho", "daegu", "gwangju", "yeosu", "chuncheon",
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
