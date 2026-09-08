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

// ─────────────────────────────────────────────────────────────
// 프론트 키 → 백엔드 enum 매핑 (온보딩 저장 API 전송용)
// ─────────────────────────────────────────────────────────────

// 지역: RegionSheet가 저장하는 한국어 표시명(displayName) → REGION enum
export const REGION_ENUM: Record<string, string> = {
  "서울": "SEOUL",
  "부산": "BUSAN",
  "인천": "INCHEON",
  "제주": "JEJU",
  "전주": "JEONJU",
  "경주": "GYEONGJU",
  "강릉": "GANGNEUNG",
  "속초": "SOKCHO",
  "대구": "DAEGU",
  "광주": "GWANGJU",
  "여수": "YEOSU",
  "춘천": "CHUNCHEON",
};

/**
 * 지역 표시명(displayName)을 REGION enum으로 변환한다.
 * 1) 정확 매칭 우선 (인기 여행지 "서울" 등)
 * 2) 검색 결과 displayName이 "서울특별시"처럼 다를 수 있어, 표시명에 키가 포함되면 매칭
 * 매칭 실패 시 null (호출부에서 처리).
 */
export function toRegionEnum(displayName: string): string | null {
  if (!displayName) return null;
  if (REGION_ENUM[displayName]) return REGION_ENUM[displayName];
  const hit = Object.keys(REGION_ENUM).find((key) => displayName.includes(key));
  return hit ? REGION_ENUM[hit] : null;
}

// 이동 수단: 프론트 키 → TRANSPORT MODE enum
export const TRANSPORT_ENUM: Record<Transport, string> = {
  walking: "WALKING",
  publicTransit: "PUBLIC_TRANSIT",
  car: "CAR",
};

// 체험 레벨: 프론트 키 → LEVEL enum
export const LEVEL_ENUM: Record<Level, string> = {
  light: "LIGHT",
  normal: "NORMAL",
  deep: "DEEP",
};

// 중분류(프론트 SUB_CATEGORIES 값) → { 백엔드 관광타입 contentType, 백엔드 중분류 subcategory }
// 서버는 preferences[].contentType(TourApiContentType enum)을 필수로 요구한다.
// 프론트 대분류와 TourAPI 관광타입 구조가 다르므로, 각 중분류가 실제 속한 관광타입을 지정하고
// 전송 시 contentType 기준으로 다시 그룹핑한다. (TourAPI 관광타입 표 기준)
export const SUBCATEGORY_ENUM: Record<string, { contentType: string; subcategory: string }> = {
  // 음식점(RESTAURANT, 39)
  korean: { contentType: "RESTAURANT", subcategory: "KOREAN_FOOD" },
  cafe: { contentType: "RESTAURANT", subcategory: "CAFE_TEAHOUSE" },
  bar: { contentType: "RESTAURANT", subcategory: "PUB" },
  allFood: { contentType: "RESTAURANT", subcategory: "LIKE_ALL_FOOD" },

  // 관광지(TOURIST_ATTRACTION, 12) — 체험/자연/역사 상당수가 여기 속함
  traditional: { contentType: "TOURIST_ATTRACTION", subcategory: "TRADITIONAL_EXPERIENCE" },
  temple: { contentType: "TOURIST_ATTRACTION", subcategory: "TEMPLE_STAY" },
  unique: { contentType: "TOURIST_ATTRACTION", subcategory: "UNIQUE_EXPERIENCE" },
  mountain: { contentType: "TOURIST_ATTRACTION", subcategory: "MOUNTAIN_FOREST" },
  beach: { contentType: "TOURIST_ATTRACTION", subcategory: "SEA_BEACH" },
  lake: { contentType: "TOURIST_ATTRACTION", subcategory: "LAKE_RIVER" },
  island: { contentType: "TOURIST_ATTRACTION", subcategory: "ISLAND" },
  park: { contentType: "TOURIST_ATTRACTION", subcategory: "PARK" },
  palace: { contentType: "TOURIST_ATTRACTION", subcategory: "PALACE" },
  ruins: { contentType: "TOURIST_ATTRACTION", subcategory: "HISTORIC_SITE" },
  village: { contentType: "TOURIST_ATTRACTION", subcategory: "TRADITIONAL_VILLAGE" },
  streetArt: { contentType: "TOURIST_ATTRACTION", subcategory: "STREET_ART" },
  buddhistTemple: { contentType: "TOURIST_ATTRACTION", subcategory: "TEMPLE" },

  // 문화시설(CULTURAL_FACILITY, 14)
  museum: { contentType: "CULTURAL_FACILITY", subcategory: "MUSEUM" },
  gallery: { contentType: "CULTURAL_FACILITY", subcategory: "GALLERY" },

  // 축제/공연/행사(FESTIVAL_EVENT, 15)
  performance: { contentType: "FESTIVAL_EVENT", subcategory: "PERFORMANCE_MUSICAL" },
  festival: { contentType: "FESTIVAL_EVENT", subcategory: "FESTIVAL_EVENT" },
  event: { contentType: "FESTIVAL_EVENT", subcategory: "PERFORMANCE_EVENT" },
  fireworks: { contentType: "FESTIVAL_EVENT", subcategory: "FIREWORKS" },
  nightMarket: { contentType: "FESTIVAL_EVENT", subcategory: "NIGHT_MARKET" },

  // 쇼핑(SHOPPING, 38)
  traditionalMarket: { contentType: "SHOPPING", subcategory: "TRADITIONAL_MARKET" },
  localShop: { contentType: "SHOPPING", subcategory: "LOCAL_SHOP" },
  dutyFree: { contentType: "SHOPPING", subcategory: "DUTY_FREE" },
  vintage: { contentType: "SHOPPING", subcategory: "VINTAGE" },

  // 레포츠(LEISURE_SPORTS, 28)
  surfing: { contentType: "LEISURE_SPORTS", subcategory: "SURFING" },
  skiing: { contentType: "LEISURE_SPORTS", subcategory: "SKIING" },
  hiking: { contentType: "LEISURE_SPORTS", subcategory: "HIKING" },
  cycling: { contentType: "LEISURE_SPORTS", subcategory: "CYCLING" },
  waterSports: { contentType: "LEISURE_SPORTS", subcategory: "WATER_SPORTS" },
};
