/** 일정 API: DTO → mapper → fetch. docs/API-RULE.md */
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from "./client";

export type PlanApiLocale = "KO" | "EN" | "JA";
export type OpenStatus = "OPEN" | "BREAK" | "CLOSED" | "UNKNOWN";
export type PlaceCategory =
  | "TOURIST_ATTRACTION"
  | "RESTAURANT"
  | "CULTURAL_FACILITY"
  | "FESTIVAL_EVENT"
  | "LEISURE_SPORTS"
  | "SHOPPING"
  | "LODGING"
  | "TRAVEL_COURSE";
interface TravelPlanSummaryDto {
  travelPlanId: number;
  name: string;
  startDate: string;
  endDate: string;
  transportMode: string;
  interestCategories: string[];
  experienceLevel: "LIGHT" | "NORMAL" | "DEEP";
  nights: number;
  days: number;
}
interface TravelPlanListDto {
  totalCount: number;
  travelPlans: TravelPlanSummaryDto[];
}
interface CourseStopDto {
  stopId: number;
  visitOrder: number;
  placeId: number;
  name: string;
  category: PlaceCategory;
  address: string | null;
  latitude: number;
  longitude: number;
  openTime: string | null;
  closeTime: string | null;
  openStatus: OpenStatus;
  distanceFromPreviousMeters: number | null;
}
interface CourseDto {
  planId: number;
  planName: string;
  dayNumber: number;
  totalDays: number;
  date: string;
  stopCount: number;
  stops: CourseStopDto[];
}
interface PlaceSearchResultDto {
  placeId: number;
  category: PlaceCategory;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  representativeImageUrl: string | null;
  openTime: string | null;
  closeTime: string | null;
  openStatus: OpenStatus;
  distanceMeters: number | null;
  alreadyAdded: boolean;
}
interface PlaceSearchPageDto {
  totalCount: number;
  page: number;
  size: number;
  places: PlaceSearchResultDto[];
}
interface AddedStopDto {
  stopId: number;
  dayNumber: number;
  visitOrder: number;
}

export interface Plan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  dayCount: number;
  transportMode: string;
  interestCategories: string[];
  experienceLevel: "LIGHT" | "NORMAL" | "DEEP";
  nights: number;
}
export interface OpenHours {
  start: string;
  end: string;
}
export interface PlanPlace {
  /** 코스 관계 stopId. 새 draft 항목은 tmp- 접두를 쓴다. */
  id: string;
  placeId: string;
  order: number;
  name: string;
  address: string | null;
  category: PlaceCategory | null;
  openStatus: OpenStatus;
  openHours: OpenHours | null;
  openTime: string | null;
  closeTime: string | null;
  lat: number;
  lng: number;
  distanceFromPreviousMeters: number | null;
}
export interface PlanDay {
  dayIndex: number;
  date: string | null;
  places: PlanPlace[];
}
export interface PlanDetail extends Plan {
  days: PlanDay[];
}
export interface PlaceSearchResult {
  id: string;
  name: string;
  address: string | null;
  category: PlaceCategory;
  distanceMeters: number | null;
  openStatus: OpenStatus;
  openHours: OpenHours | null;
  openTime: string | null;
  closeTime: string | null;
  thumbnailUrl: string | null;
  lat: number;
  lng: number;
  alreadyAdded: boolean;
}
export interface PlaceSearchPage {
  items: PlaceSearchResult[];
  totalCount: number;
  nextPage: number | null;
}

function toOpenHours(
  start: string | null,
  end: string | null,
): OpenHours | null {
  return start && end ? { start, end } : null;
}
export function toPlan(dto: TravelPlanSummaryDto): Plan {
  return {
    id: String(dto.travelPlanId),
    name: dto.name,
    startDate: dto.startDate,
    endDate: dto.endDate,
    dayCount: dto.days,
    transportMode: dto.transportMode,
    interestCategories: dto.interestCategories ?? [],
    experienceLevel: dto.experienceLevel,
    nights: dto.nights,
  };
}
export function toPlanPlace(dto: CourseStopDto): PlanPlace {
  return {
    id: String(dto.stopId),
    placeId: String(dto.placeId),
    order: dto.visitOrder,
    name: dto.name,
    address: dto.address,
    category: dto.category,
    openStatus: dto.openStatus,
    openHours: toOpenHours(dto.openTime, dto.closeTime),
    openTime: dto.openTime,
    closeTime: dto.closeTime,
    lat: dto.latitude,
    lng: dto.longitude,
    distanceFromPreviousMeters: dto.distanceFromPreviousMeters,
  };
}
export function toPlanDay(dto: CourseDto): PlanDay {
  return {
    dayIndex: dto.dayNumber - 1,
    date: dto.date,
    places: dto.stops.map(toPlanPlace),
  };
}
export function toPlaceSearchResult(
  dto: PlaceSearchResultDto,
): PlaceSearchResult {
  return {
    id: String(dto.placeId),
    name: dto.name,
    address: dto.address,
    category: dto.category,
    distanceMeters: dto.distanceMeters,
    openStatus: dto.openStatus,
    openHours: toOpenHours(dto.openTime, dto.closeTime),
    openTime: dto.openTime,
    closeTime: dto.closeTime,
    thumbnailUrl: dto.representativeImageUrl,
    lat: dto.latitude,
    lng: dto.longitude,
    alreadyAdded: dto.alreadyAdded,
  };
}
export function toPlanApiLocale(locale: string): PlanApiLocale {
  return locale === "ko" ? "KO" : locale === "ja" ? "JA" : "EN";
}
export async function fetchPlans(): Promise<Plan[]> {
  const data = (await apiGet<TravelPlanListDto>("/api/travel-plans")).data;
  return (data?.travelPlans ?? []).map(toPlan);
}

/** 여행 일정 삭제. DELETE /api/travel-plans/{travelPlanId} */
export async function deleteTravelPlan(planId: string): Promise<void> {
  await apiDelete(`/api/travel-plans/${Number(planId)}`);
}
export async function fetchPlanCourse(
  planId: string,
  dayIndex: number,
  locale: PlanApiLocale,
): Promise<PlanDay> {
  const dto = (
    await apiGet<CourseDto>(`/api/travel-plans/${Number(planId)}/course`, {
      dayNumber: dayIndex + 1,
      locale,
    })
  ).data;
  return toPlanDay(dto);
}
export async function fetchPlanDetail(
  planId: string,
  dayIndex: number,
  locale: PlanApiLocale,
): Promise<PlanDetail> {
  const [plans, day] = await Promise.all([
    fetchPlans(),
    fetchPlanCourse(planId, dayIndex, locale),
  ]);
  const summary = plans.find((p) => p.id === planId);
  if (!summary) throw new ApiError(404, "일정을 찾을 수 없어요");
  return { ...summary, dayCount: Math.max(1, summary.dayCount), days: [day] };
}
export const PLACE_SEARCH_SIZE = 10;
export async function searchPlaces(input: {
  keyword: string;
  locale: PlanApiLocale;
  planId: string;
  page: number;
}): Promise<PlaceSearchPage> {
  const dto = (
    await apiGet<PlaceSearchPageDto>("/api/places/search", {
      keyword: input.keyword,
      locale: input.locale,
      planId: Number(input.planId),
      page: input.page,
      size: PLACE_SEARCH_SIZE,
    })
  ).data;
  return {
    items: dto.places.map(toPlaceSearchResult),
    totalCount: dto.totalCount,
    nextPage: dto.page * dto.size < dto.totalCount ? dto.page + 1 : null,
  };
}

export function calculateDayChanges(original: PlanPlace[], draft: PlanPlace[]) {
  const originalIds = new Set(original.map((p) => p.id));
  const draftIds = new Set(draft.map((p) => p.id));
  const removed = original.filter((p) => !draftIds.has(p.id));
  const added = draft.filter((p) => !originalIds.has(p.id));
  const changed =
    removed.length > 0 ||
    added.length > 0 ||
    draft.some((p, i) => original[i]?.id !== p.id);
  return { removed, added, changed };
}
export async function deletePlanStop(
  planId: string,
  stopId: string,
): Promise<void> {
  await apiDelete(
    `/api/travel-plans/${Number(planId)}/course/stops/${Number(stopId)}`,
  );
}
export async function addPlanStop(
  planId: string,
  dayIndex: number,
  placeId: string,
): Promise<string> {
  const dto = (
    await apiPost<AddedStopDto>(
      `/api/travel-plans/${Number(planId)}/course/stops`,
      {
        placeId: Number(placeId),
        dayNumber: dayIndex + 1,
      },
    )
  ).data;
  return String(dto.stopId);
}
export async function reorderPlanStops(
  planId: string,
  stops: PlanPlace[],
): Promise<void> {
  await apiPatch(`/api/travel-plans/${Number(planId)}/course/stops/order`, {
    orders: stops.map((p, i) => ({ stopId: Number(p.id), visitOrder: i + 1 })),
  });
}
export class PlanSaveError extends Error {
  constructor(
    public readonly causeError: unknown,
    public readonly writesStarted: boolean,
  ) {
    super("Plan save failed");
  }
}
export interface SavePlanDayInput {
  planId: string;
  dayIndex: number;
  locale: PlanApiLocale;
  original: PlanPlace[];
  draft: PlanPlace[];
}
/** 삭제 → 추가 → 전체 순서 → 재조회. 실패 후 후속 쓰기는 보내지 않는다. */
export async function savePlanDay(input: SavePlanDayInput): Promise<PlanDay> {
  const changes = calculateDayChanges(input.original, input.draft);
  if (!changes.changed)
    return fetchPlanCourse(input.planId, input.dayIndex, input.locale);
  let writesStarted = false;
  try {
    for (const place of changes.removed) {
      writesStarted = true;
      await deletePlanStop(input.planId, place.id);
    }
    const finalStops = [...input.draft];
    for (const place of changes.added) {
      writesStarted = true;
      const stopId = await addPlanStop(
        input.planId,
        input.dayIndex,
        place.placeId,
      );
      const index = finalStops.findIndex((p) => p.id === place.id);
      finalStops[index] = { ...place, id: stopId };
    }
    if (finalStops.length) {
      writesStarted = true;
      await reorderPlanStops(input.planId, finalStops);
    }
    const reloaded = await fetchPlanCourse(
      input.planId,
      input.dayIndex,
      input.locale,
    );
    const expected = finalStops.map((p) => p.id);
    if (
      reloaded.places.length !== expected.length ||
      reloaded.places.some((p, i) => p.id !== expected[i])
    ) {
      throw new ApiError(409, "저장 결과가 서버 코스와 다릅니다.");
    }
    return reloaded;
  } catch (err) {
    throw new PlanSaveError(err, writesStarted);
  }
}
