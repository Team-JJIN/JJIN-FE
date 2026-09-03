/**
 * 미션 도메인 TanStack Query 쿼리 키 팩토리 + 훅 모음.
 */
"use client";

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  fetchMissions,
  searchMissions,
  fetchMissionDetail,
  fetchMissionPlanLikes,
  addMissionToPlans,
  removeMissionFromPlans,
  createMission,
  uploadMissionImage,
} from "@/app/_api/missions";
import type {
  Mission,
  MissionDetail,
  MissionPlanLikes,
  MissionFilter,
  MissionDifficulty,
  SearchMissionsParams,
  Paginated,
} from "@/app/_api/missions";
import type { SearchFilterState } from "../_types";

// --- 쿼리 키 팩토리 ---
export const missionKeys = {
  all: ["missions"] as const,
  list: (filter: MissionFilter) =>
    [...missionKeys.all, "list", filter] as const,
  search: (params: SearchFilterState) =>
    [...missionKeys.all, "search", params] as const,
  searchCount: (params: Omit<SearchMissionsParams, "cursor">) =>
    [...missionKeys.all, "searchCount", params] as const,
  detail: (id: string) => [...missionKeys.all, "detail", id] as const,
  planLikes: (id: string) => [...missionKeys.all, "planLikes", id] as const,
};

// 미션 추천 목록 (필터별 무한 스크롤)
export function useMissionList(filter: MissionFilter) {
  return useInfiniteQuery({
    queryKey: missionKeys.list(filter),
    queryFn: ({ pageParam }) => fetchMissions({ filter, cursor: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  });
}

// 미션 검색 (검색어/카테고리/난이도/정렬, 무한 스크롤)
export function useMissionSearch(params: SearchFilterState) {
  return useInfiniteQuery({
    queryKey: missionKeys.search(params),
    queryFn: ({ pageParam }) =>
      searchMissions({ ...params, cursor: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  });
}

// 검색 필터 조합에 해당하는 총 미션 수 (CategorySheet 확인 버튼 라벨용)
// enabled: 시트가 닫혀 있을 때는 조회하지 않는다 — 검색 페이지에서 필터를 바꿀 때마다 카운트가
// 따라 도는 것을 막고, 비활성 쿼리는 invalidateQueries의 재조회 대상에서도 빠진다.
// 키는 ["missions"] prefix 아래에 둔다 — 미션 생성 시 총 건수가 실제로 바뀌므로
// useCreateMission의 missionKeys.all invalidate에 같이 걸리는 것이 맞다.
export function useMissionSearchCount(
  params: Omit<SearchMissionsParams, "cursor">,
  enabled = true,
) {
  return useQuery<number>({
    queryKey: missionKeys.searchCount(params),
    queryFn: () =>
      searchMissions({ ...params, cursor: 0 }).then((p) => p.totalCount),
    placeholderData: keepPreviousData,
    enabled,
  });
}

// 미션 상세 (시트가 열렸을 때만 조회)
export function useMissionDetail(missionId: string | null, enabled: boolean) {
  return useQuery<MissionDetail>({
    queryKey: missionKeys.detail(missionId ?? ""),
    queryFn: () => fetchMissionDetail(missionId as string),
    enabled: enabled && !!missionId,
  });
}

// 미션의 일정별 찜 여부 (일정 추가 화면이 열렸을 때만 조회)
export function useMissionPlanLikes(
  missionId: string | null,
  enabled: boolean,
) {
  return useQuery<MissionPlanLikes>({
    queryKey: missionKeys.planLikes(missionId ?? ""),
    queryFn: () => fetchMissionPlanLikes(missionId as string),
    enabled: enabled && !!missionId,
  });
}

// 미션 생성 (이미지 업로드 → 생성을 mutationFn 안에서 순차 실행)
export function useCreateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      difficulty,
      hashtags,
      file,
    }: {
      title: string;
      description: string;
      difficulty: MissionDifficulty;
      hashtags: string[];
      file: File;
    }) => {
      const imageUrl = await uploadMissionImage(file);
      const created = await createMission({
        title,
        description,
        difficulty,
        hashtags,
        imageUrl,
      });
      // 서버 응답은 missionId뿐이라, 생성 직후 시트 preview(썸네일)에 쓸 업로드 URL을 함께 돌려준다
      return { id: created.id, imageUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.all });
    },
  });
}

// missionKeys.all 아래 모든 무한 스크롤 페이지에서 해당 미션의 isAdded를 패치한다.
// list·search 페이지 형태가 달라도(search는 totalCount 포함) items만 있으면 매칭한다.
// ["missions"] prefix에는 인피니트가 아닌 캐시(detail 단건, searchCount 단발 조회)도 걸릴 수
// 있다 — pages 배열이 없으면 패치 대상이 아니므로 그대로 통과시킨다.
// (여기서 throw가 나면 onMutate 전체가 실패해 mutation이 시작되지 않는다)
// page.items가 배열이 아닌 페이지도 마찬가지로 그대로 통과시킨다 (useFeedQueries.ts의
// patchFeedPost와 동일한 방어).
function patchMissionInPages<T extends { items: Mission[] }>(
  old: InfiniteData<T> | undefined,
  missionId: string,
  isAdded: boolean,
): InfiniteData<T> | undefined {
  if (!old || !Array.isArray(old.pages)) return old;
  return {
    ...old,
    pages: old.pages.map((page) => {
      if (!Array.isArray(page.items)) return page;
      return {
        ...page,
        items: page.items.map((m) =>
          m.id === missionId ? { ...m, isAdded } : m,
        ),
      };
    }),
  };
}

// 미션을 담을 일정 목록을 갱신 (add/remove diff를 순차 반영) — 낙관적 업데이트 → 실패 시 롤백 →
// 정리 시 detail·planLikes·목록 전부 invalidate
export function useUpdateMissionPlans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      missionId,
      addPlanIds,
      removePlanIds,
    }: {
      missionId: string;
      addPlanIds: string[];
      removePlanIds: string[];
      nextIsAdded: boolean;
    }) => {
      // add → remove 순차 호출. 부분 실패(add 성공·remove 실패)는 onError 롤백 뒤
      // onSettled invalidate가 서버 진실로 수렴시키고, 실패 자체는 AddMissionPanel이
      // isError로 표시한다.
      if (addPlanIds.length > 0) {
        await addMissionToPlans(missionId, addPlanIds);
      }
      if (removePlanIds.length > 0) {
        await removeMissionFromPlans(missionId, removePlanIds);
      }
    },
    onMutate: async ({ missionId, nextIsAdded }) => {
      await queryClient.cancelQueries({ queryKey: missionKeys.all });

      const previousMissionQueries = queryClient.getQueriesData<
        InfiniteData<Paginated<Mission>>
      >({ queryKey: missionKeys.all });
      const previousDetail = queryClient.getQueryData<MissionDetail>(
        missionKeys.detail(missionId),
      );

      queryClient.setQueriesData<InfiniteData<Paginated<Mission>>>(
        { queryKey: missionKeys.all },
        (old) => patchMissionInPages(old, missionId, nextIsAdded),
      );
      queryClient.setQueryData<MissionDetail>(
        missionKeys.detail(missionId),
        (old) => (old ? { ...old, isAdded: nextIsAdded } : old),
      );

      return { previousMissionQueries, previousDetail, missionId };
    },
    onError: (_err, _variables, context) => {
      context?.previousMissionQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      if (context) {
        queryClient.setQueryData(
          missionKeys.detail(context.missionId),
          context.previousDetail,
        );
      }
    },
    onSettled: (_data, _error, { missionId }) => {
      queryClient.invalidateQueries({
        queryKey: missionKeys.detail(missionId),
      });
      queryClient.invalidateQueries({
        queryKey: missionKeys.planLikes(missionId),
      });
      queryClient.invalidateQueries({ queryKey: missionKeys.all });
    },
  });
}

// 참고용 재수출 타입 (호출부 편의)
export type { Mission };
