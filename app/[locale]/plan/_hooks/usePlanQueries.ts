"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocale } from "@/app/_components/hooks/useLocale";
import {
  fetchPlans,
  fetchPlanDetail,
  savePlanDay,
  searchPlaces,
  toPlanApiLocale,
  PlanSaveError,
  type PlanDetail,
} from "@/app/_api/plans";

export const planKeys = {
  all: ["plans"] as const,
  list: () => [...planKeys.all, "list"] as const,
  detail: (id: string, dayIndex: number, locale: string) =>
    [...planKeys.all, "detail", id, dayIndex, locale] as const,
  placeSearch: (planId: string, keyword: string, locale: string) =>
    ["placeSearch", planId, keyword, locale] as const,
};

export function usePlans() {
  return useQuery({ queryKey: planKeys.list(), queryFn: fetchPlans });
}

/** 활성 일차만 조회한다. */
export function usePlanDetail(planId: string, dayIndex = 0) {
  const uiLocale = useLocale();
  const locale = toPlanApiLocale(uiLocale);
  return useQuery({
    queryKey: planKeys.detail(planId, dayIndex, locale),
    queryFn: () => fetchPlanDetail(planId, dayIndex, locale),
  });
}

export function useSavePlanDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savePlanDay,
    retry: false,
    async onSuccess(day, vars) {
      const key = planKeys.detail(vars.planId, vars.dayIndex, vars.locale);
      queryClient.setQueryData<PlanDetail>(key, (prev) =>
        prev ? { ...prev, days: [day] } : prev,
      );
      await queryClient.invalidateQueries({
        queryKey: [...planKeys.all, "detail", vars.planId, vars.dayIndex],
        refetchType: "none",
      });
      await queryClient.invalidateQueries({
        queryKey: ["placeSearch", vars.planId],
      });
    },
    async onError(error, vars) {
      if (error instanceof PlanSaveError && error.writesStarted) {
        await queryClient.invalidateQueries({
          queryKey: ["placeSearch", vars.planId],
        });
      }
    },
  });
}

export function usePlaceSearch(planId: string, keyword: string) {
  const uiLocale = useLocale();
  const locale = toPlanApiLocale(uiLocale);
  const trimmed = keyword.trim();
  return useInfiniteQuery({
    queryKey: planKeys.placeSearch(planId, trimmed, locale),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      searchPlaces({
        planId,
        keyword: trimmed,
        locale,
        page: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    enabled: trimmed.length > 0 && !!planId,
  });
}
