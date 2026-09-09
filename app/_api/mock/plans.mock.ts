/**
 * @module api/mock/plans.mock
 * plans.ts가 소비하는 DTO 형태 mock 데이터 + 응답 생성 함수(mockXxx). mock 단계에서만 존재.
 * 좌표는 전부 인천 — Kakao 지도가 국내만 표시하므로 해외 좌표를 넣지 않는다.
 */

import { ApiError } from "../client";
import type {
  TravelPlanSummaryDto,
  TravelPlanDetailDto,
  TravelPlanDayDto,
  TravelPlanPlaceDto,
  SavePlanDayRequestDto,
  PlaceSortDto,
  PlaceSearchResultDto,
} from "../plans";

export function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ───────────── 장소 카탈로그 (검색 결과 8건 + 일정 기존 장소 3건이 공유, placeId 기준) ─────────────

const PLACE_CATALOG: Record<
  number,
  Omit<TravelPlanPlaceDto, "planPlaceId" | "order">
> = {
  // 일정(travelPlanId 1)에 이미 담긴 3건
  1: {
    placeId: 1,
    name: "인천 소품카페",
    address: "인천 미추홀구 학익소로 12",
    category: "카페",
    isOpen: false,
    openTime: "10:00",
    closeTime: "22:00",
    latitude: 37.463,
    longitude: 126.65,
  },
  2: {
    placeId: 2,
    name: "인천 짬뽕집",
    address: "인천 미추홀구 인주대로 100",
    category: "음식점",
    isOpen: true,
    openTime: "11:00",
    closeTime: "21:00",
    latitude: 37.4635,
    longitude: 126.6505,
  },
  3: {
    placeId: 3,
    name: "월미도 전망대",
    address: "인천 중구 월미문화로 21",
    category: "관광명소",
    isOpen: null,
    openTime: null,
    closeTime: null,
    latitude: 37.475,
    longitude: 126.598,
  },
  // 검색 전용 8건 (몇몇은 이름/주소에 "카페"·"미추홀구" 포함 — Figma 최근 검색 "미추홀구 카페" 대응)
  4: {
    placeId: 4,
    name: "미추홀구 감성카페",
    address: "인천 미추홀구 학익소로 12",
    category: "카페",
    isOpen: true,
    openTime: "10:00",
    closeTime: "22:00",
    latitude: 37.4632,
    longitude: 126.6512,
  },
  5: {
    placeId: 5,
    name: "구월동 카페거리 1번지",
    address: "인천 남동구 구월로 100",
    category: "카페",
    isOpen: false,
    openTime: "09:00",
    closeTime: "20:00",
    latitude: 37.448,
    longitude: 126.706,
  },
  6: {
    placeId: 6,
    name: "송도 브런치 카페",
    address: "인천 연수구 송도과학로 32",
    category: "카페",
    isOpen: true,
    openTime: "08:00",
    closeTime: "21:00",
    latitude: 37.392,
    longitude: 126.64,
  },
  7: {
    placeId: 7,
    name: "미추홀구 전통시장 국밥",
    address: "인천 미추홀구 문화로 8",
    category: "음식점",
    isOpen: true,
    openTime: "06:00",
    closeTime: "15:00",
    latitude: 37.462,
    longitude: 126.648,
  },
  8: {
    placeId: 8,
    name: "차이나타운 화덕만두",
    address: "인천 중구 차이나타운로 43",
    category: "음식점",
    isOpen: false,
    openTime: "11:00",
    closeTime: "20:00",
    latitude: 37.475,
    longitude: 126.617,
  },
  9: {
    placeId: 9,
    name: "부평 로스터리 카페",
    address: "인천 부평구 부평대로 220",
    category: "카페",
    isOpen: true,
    openTime: "09:00",
    closeTime: "23:00",
    latitude: 37.489,
    longitude: 126.724,
  },
  10: {
    placeId: 10,
    name: "월미도 디저트 카페",
    address: "인천 중구 월미문화로 25",
    category: "카페",
    isOpen: null,
    openTime: null,
    closeTime: null,
    latitude: 37.4752,
    longitude: 126.5983,
  },
  11: {
    placeId: 11,
    name: "구월동 곱창골목",
    address: "인천 남동구 구월로 55",
    category: "음식점",
    isOpen: true,
    openTime: "17:00",
    closeTime: "02:00",
    latitude: 37.449,
    longitude: 126.705,
  },
};

// 검색 전용 부가 필드(거리/평점/썸네일) — PLACE_CATALOG와 합쳐 검색 결과 DTO를 만든다
const SEARCH_EXTRA: Record<
  number,
  Pick<PlaceSearchResultDto, "distanceMeters" | "rating" | "thumbnailUrl">
> = {
  4: { distanceMeters: 230, rating: 4.5, thumbnailUrl: null },
  5: { distanceMeters: 999, rating: 3.8, thumbnailUrl: null },
  6: { distanceMeters: 4200, rating: 4.9, thumbnailUrl: null },
  7: { distanceMeters: null, rating: null, thumbnailUrl: null },
  8: { distanceMeters: 5100, rating: 4.2, thumbnailUrl: null },
  9: { distanceMeters: 6300, rating: 4.0, thumbnailUrl: null },
  10: { distanceMeters: 5800, rating: 3.5, thumbnailUrl: null },
  11: { distanceMeters: 1234, rating: 4.6, thumbnailUrl: null },
};

const SEARCH_PLACE_IDS = [4, 5, 6, 7, 8, 9, 10, 11];

function toSearchResultDto(placeId: number): PlaceSearchResultDto {
  const place = PLACE_CATALOG[placeId];
  const extra = SEARCH_EXTRA[placeId];
  return {
    placeId: place.placeId,
    name: place.name,
    address: place.address,
    distanceMeters: extra.distanceMeters,
    isOpen: place.isOpen,
    openTime: place.openTime,
    closeTime: place.closeTime,
    thumbnailUrl: extra.thumbnailUrl,
    rating: extra.rating,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

// ───────────── 일정 상세 mutable 상태 ─────────────

let detailState: TravelPlanDetailDto = {
  travelPlanId: 1,
  name: "인천 주말 여행",
  startDate: "2026-03-06",
  endDate: "2026-03-08",
  days: [
    {
      dayIndex: 0,
      date: "2026-03-06",
      places: [
        { ...PLACE_CATALOG[1], planPlaceId: 101, order: 1 },
        { ...PLACE_CATALOG[2], planPlaceId: 102, order: 2 },
      ],
    },
    {
      dayIndex: 1,
      date: "2026-03-07",
      places: [{ ...PLACE_CATALOG[3], planPlaceId: 103, order: 1 }],
    },
    {
      // date: null — PlanDay 소비처의 addDays fallback 경로 검증용 (2026-03-08이어야 하나 서버가 비워 보낸 케이스 가정)
      dayIndex: 2,
      date: null,
      places: [],
    },
  ],
};

let nextPlanPlaceId = 104;

export function mockFetchPlans(): TravelPlanSummaryDto[] {
  return structuredClone([
    {
      travelPlanId: detailState.travelPlanId,
      name: detailState.name,
      startDate: detailState.startDate,
      endDate: detailState.endDate,
      days: detailState.days.length,
    },
  ]);
}

export function mockFetchPlanDetail(travelPlanId: number): TravelPlanDetailDto {
  if (travelPlanId !== detailState.travelPlanId) {
    throw new ApiError(404, "일정을 찾을 수 없어요");
  }
  return structuredClone(detailState);
}

export function mockSavePlanDay(
  travelPlanId: number,
  dayIndex: number,
  body: SavePlanDayRequestDto,
): TravelPlanDayDto {
  if (travelPlanId !== detailState.travelPlanId) {
    throw new ApiError(404, "일정을 찾을 수 없어요");
  }
  for (const p of body.places) {
    if (!(p.placeId in PLACE_CATALOG)) {
      throw new ApiError(400, "알 수 없는 장소예요");
    }
  }

  const day = detailState.days.find((d) => d.dayIndex === dayIndex);
  if (!day) {
    throw new ApiError(404, "일정을 찾을 수 없어요");
  }

  // 기존에 그 일차에 있던 placeId는 planPlaceId를 유지하고, 새 placeId는 새로 발급한다.
  const existingPlanPlaceId = new Map(
    day.places.map((p) => [p.placeId, p.planPlaceId]),
  );

  day.places = body.places.map(({ placeId, order }) => {
    const catalogPlace = PLACE_CATALOG[placeId];
    const planPlaceId = existingPlanPlaceId.get(placeId) ?? nextPlanPlaceId++;
    return { ...catalogPlace, planPlaceId, order };
  });

  return structuredClone(day);
}

export function mockSearchPlaces(
  keyword: string,
  sort: PlaceSortDto,
): PlaceSearchResultDto[] {
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed) return [];

  const matched = SEARCH_PLACE_IDS.filter((placeId) => {
    const place = PLACE_CATALOG[placeId];
    return (
      place.name.toLowerCase().includes(trimmed) ||
      place.address.toLowerCase().includes(trimmed)
    );
  }).map(toSearchResultDto);

  switch (sort) {
    case "DISTANCE":
      return matched.sort((a, b) => {
        if (a.distanceMeters === null) return 1;
        if (b.distanceMeters === null) return -1;
        return a.distanceMeters - b.distanceMeters;
      });
    case "RATING":
      return matched.sort((a, b) => {
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return b.rating - a.rating;
      });
    case "RECENT":
    default:
      return matched;
  }
}
