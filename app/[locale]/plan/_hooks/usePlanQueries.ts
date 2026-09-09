/**
 * 일정 상세 도메인 TanStack Query 쿼리 키 팩토리 + 훅 모음.
 */
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchPlans,
  fetchPlanDetail,
  savePlanDay,
  searchPlaces,
} from "@/app/_api/plans";
import type { PlanDetail, PlaceSort } from "@/app/_api/plans";

// --- 쿼리 키 팩토리 ---
export const planKeys = {
  all: ["plans"] as const,
  list: () => [...planKeys.all, "list"] as const,
  detail: (id: string) => [...planKeys.all, "detail", id] as const,
  // 독립 루트 — planKeys.all 밑에 두면 일정 무효화(invalidate) 시 검색 결과까지 함께 재조회된다 (API-RULE §4-7)
  placeSearch: (keyword: string, sort: PlaceSort) =>
    ["placeSearch", keyword, sort] as const,
};

// 내 일정 목록
export function usePlans() {
  return useQuery({
    queryKey: planKeys.list(),
    queryFn: fetchPlans,
  });
}

// 일정 상세
export function usePlanDetail(planId: string) {
  return useQuery({
    queryKey: planKeys.detail(planId),
    queryFn: () => fetchPlanDetail(planId),
  });
}

// 일차 장소 저장 — 낙관적 업데이트 없음. 응답(day)이 그 일차의 진실이므로 캐시에 그대로 반영 후 invalidate로 수렴시킨다.
export function useSavePlanDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: savePlanDay,
    onSuccess(day, vars) {
      queryClient.setQueryData<PlanDetail>(
        planKeys.detail(vars.planId),
        (prev) =>
          prev
            ? {
                ...prev,
                days: prev.days.map((d) =>
                  d.dayIndex === day.dayIndex ? day : d,
                ),
              }
            : prev,
      );
      void queryClient.invalidateQueries({
        queryKey: planKeys.detail(vars.planId),
      });
    },
  });
}

// 장소 검색 — 빈 키워드는 조회하지 않는다. sort 전환 시 이전 결과를 유지해 깜빡임을 없앤다.
export function usePlaceSearch(keyword: string, sort: PlaceSort) {
  const k = keyword.trim();
  return useQuery({
    queryKey: planKeys.placeSearch(k, sort),
    queryFn: () => searchPlaces({ keyword: k, sort }),
    enabled: k.length > 0,
    placeholderData: keepPreviousData,
  });
}
