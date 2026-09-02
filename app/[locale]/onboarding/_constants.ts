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

// 중분류(프론트 SUB_CATEGORIES 값) → { 백엔드 대분류 contentType, 백엔드 중분류 subcategory }
// 백엔드 TRAVEL TYPE 명세 기준. 서버는 preferences[].contentType(TRAVEL TYPE enum)을 요구하며,
// 프론트 대분류와 백엔드 대분류 구조가 다르므로 중분류 단위로 실제 소속 대분류를 지정한다.
// 전송 시 contentType 기준으로 다시 그룹핑한다.
export const SUBCATEGORY_ENUM: Record<string, { contentType: string; subcategory: string }> = {
  // food (음식) → RESTAURANT(음식점)
  korean: { contentType: "RESTAURANT", subcategory: "KOREAN_FOOD" },
  cafe: { contentType: "RESTAURANT", subcategory: "CAFE_TEAHOUSE" },
  bar: { contentType: "RESTAURANT", subcategory: "PUB" },
  allFood: { contentType: "RESTAURANT", subcategory: "LIKE_ALL_FOOD" },

  // experience (체험관광) → TOURIST_ATTRACTION(관광지)
  traditional: { contentType: "TOURIST_ATTRACTION", subcategory: "TRADITIONAL_EXPERIENCE" },
  temple: { contentType: "TOURIST_ATTRACTION", subcategory: "TEMPLE_STAY" },
  unique: { contentType: "TOURIST_ATTRACTION", subcategory: "UNIQUE_EXPERIENCE" },

  // nature (자연관광) → TOURIST_ATTRACTION(관광지)
  mountain: { contentType: "TOURIST_ATTRACTION", subcategory: "MOUNTAIN_FOREST" },
  beach: { contentType: "TOURIST_ATTRACTION", subcategory: "SEA_BEACH" },
  lake: { contentType: "TOURIST_ATTRACTION", subcategory: "LAKE_RIVER" },
  island: { contentType: "TOURIST_ATTRACTION", subcategory: "ISLAND" },
  park: { contentType: "TOURIST_ATTRACTION", subcategory: "PARK" },

  // history (역사관광) → 궁궐/유적지/전통마을은 TOURIST_ATTRACTION, 박물관은 CULTURAL_FACILITY
  palace: { contentType: "TOURIST_ATTRACTION", subcategory: "PALACE" },
  ruins: { contentType: "TOURIST_ATTRACTION", subcategory: "HISTORIC_SITE" },
  village: { contentType: "TOURIST_ATTRACTION", subcategory: "TRADITIONAL_VILLAGE" },
  museum: { contentType: "CULTURAL_FACILITY", subcategory: "MUSEUM" },

  // culture (문화관광) → 미술관은 CULTURAL_FACILITY, 공연은 FESTIVAL_EVENT, 거리예술/사찰은 TOURIST_ATTRACTION
  gallery: { contentType: "CULTURAL_FACILITY", subcategory: "GALLERY" },
  performance: { contentType: "FESTIVAL_EVENT", subcategory: "PERFORMANCE_MUSICAL" },
  streetArt: { contentType: "TOURIST_ATTRACTION", subcategory: "STREET_ART" },
  buddhistTemple: { contentType: "TOURIST_ATTRACTION", subcategory: "TEMPLE" },

  // shopping (쇼핑) → SHOPPING(쇼핑)
  traditionalMarket: { contentType: "SHOPPING", subcategory: "TRADITIONAL_MARKET" },
  localShop: { contentType: "SHOPPING", subcategory: "LOCAL_SHOP" },
  dutyFree: { contentType: "SHOPPING", subcategory: "DUTY_FREE" },
  vintage: { contentType: "SHOPPING", subcategory: "VINTAGE" },

  // festival (축제·공연·행사) → FESTIVAL_EVENT(축제/공연/행사)
  festival: { contentType: "FESTIVAL_EVENT", subcategory: "FESTIVAL_EVENT" },
  event: { contentType: "FESTIVAL_EVENT", subcategory: "PERFORMANCE_EVENT" },
  fireworks: { contentType: "FESTIVAL_EVENT", subcategory: "FIREWORKS" },
  nightMarket: { contentType: "FESTIVAL_EVENT", subcategory: "NIGHT_MARKET" },

  // leisure (레저스포츠) → LEISURE_SPORTS(레포츠)
  surfing: { contentType: "LEISURE_SPORTS", subcategory: "SURFING" },
  skiing: { contentType: "LEISURE_SPORTS", subcategory: "SKIING" },
  hiking: { contentType: "LEISURE_SPORTS", subcategory: "HIKING" },
  cycling: { contentType: "LEISURE_SPORTS", subcategory: "CYCLING" },
  waterSports: { contentType: "LEISURE_SPORTS", subcategory: "WATER_SPORTS" },
};
