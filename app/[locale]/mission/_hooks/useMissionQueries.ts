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
  fetchMyPlans,
  createMission,
  addMissionToPlan,
  removeMissionFromPlan,
  fetchFeed,
  toggleFeedLike,
} from "@/app/_api/missions";
import type {
  Mission,
  MissionFilter,
  Paginated,
  FeedPost,
  FeedTab,
} from "@/app/_api/missions";
import type { SearchFilterState } from "../_types";

// --- 쿼리 키 팩토리 ---
export const missionKeys = {
  all: ["missions"] as const,
  list: (filter: MissionFilter) =>
    [...missionKeys.all, "list", filter] as const,
  search: (params: SearchFilterState) =>
    [...missionKeys.all, "search", params] as const,
};

export const planKeys = {
  my: ["myPlans"] as const,
};

export const feedKeys = {
  all: ["missionFeed"] as const,
  list: (tab: FeedTab) => [...feedKeys.all, tab] as const,
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

// 미션 인증 피드 (탭별 무한 스크롤)
export function useFeed(tab: FeedTab) {
  return useInfiniteQuery({
    queryKey: feedKeys.list(tab),
    queryFn: ({ pageParam }) => fetchFeed({ tab, cursor: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  });
}

// 내 일정 목록 (미션 추가 오버레이가 열렸을 때만 조회)
export function useMyPlans(enabled: boolean) {
  return useQuery({
    queryKey: planKeys.my,
    queryFn: fetchMyPlans,
    enabled,
  });
}

// 미션 생성
export function useCreateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.all });
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

// 미션 추가/제거 시 미션·피드 인피니트 캐시에서 해당 미션의 필드를 갱신한다.
// list·search 페이지 형태가 달라도(search는 totalCount 포함) ...page 스프레드로 나머지 필드를 보존한다.
function patchMissionInPages<T extends { items: Mission[] }>(
  old: InfiniteData<T> | undefined,
  missionId: string,
  patch: Partial<Pick<Mission, "isAdded" | "addedPlanId">>,
): InfiniteData<T> | undefined {
  // ["missions"] prefix에는 인피니트가 아닌 캐시(예: 카테고리 시트의 카운트 단발 조회)도
  // 걸릴 수 있다 — pages 배열이 없으면 패치 대상이 아니므로 그대로 통과시킨다.
  // (여기서 throw가 나면 onMutate 전체가 실패해 mutation이 시작되지 않는다)
  if (!old || !Array.isArray(old.pages)) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      items: page.items.map((m) =>
        m.id === missionId ? { ...m, ...patch } : m,
      ),
    })),
  };
}

function patchMissionInFeedPages(
  old: InfiniteData<Paginated<FeedPost>> | undefined,
  missionId: string,
  patch: Partial<Pick<Mission, "isAdded" | "addedPlanId">>,
): InfiniteData<Paginated<FeedPost>> | undefined {
  if (!old || !Array.isArray(old.pages)) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      items: page.items.map((post) =>
        post.mission.id === missionId
          ? { ...post, mission: { ...post.mission, ...patch } }
          : post,
      ),
    })),
  };
}

// 미션을 내 일정에 추가 (낙관적 업데이트)
export function useAddMissionToPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      missionId,
      planId,
    }: {
      missionId: string;
      planId: string;
    }) => addMissionToPlan(missionId, planId),
    onMutate: async ({ missionId, planId }) => {
      await queryClient.cancelQueries({ queryKey: missionKeys.all });
      await queryClient.cancelQueries({ queryKey: feedKeys.all });

      const previousMissionQueries = queryClient.getQueriesData<
        InfiniteData<Paginated<Mission>>
      >({ queryKey: missionKeys.all });
      const previousFeedQueries = queryClient.getQueriesData<
        InfiniteData<Paginated<FeedPost>>
      >({ queryKey: feedKeys.all });

      const patch = { isAdded: true, addedPlanId: planId };

      queryClient.setQueriesData<InfiniteData<Paginated<Mission>>>(
        { queryKey: missionKeys.all },
        (old) => patchMissionInPages(old, missionId, patch),
      );
      queryClient.setQueriesData<InfiniteData<Paginated<FeedPost>>>(
        { queryKey: feedKeys.all },
        (old) => patchMissionInFeedPages(old, missionId, patch),
      );

      return { previousMissionQueries, previousFeedQueries };
    },
    onError: (_err, _variables, context) => {
      context?.previousMissionQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousFeedQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.all });
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

// 미션 추가 취소 (낙관적 업데이트)
export function useRemoveMissionFromPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (missionId: string) => removeMissionFromPlan(missionId),
    onMutate: async (missionId) => {
      await queryClient.cancelQueries({ queryKey: missionKeys.all });
      await queryClient.cancelQueries({ queryKey: feedKeys.all });

      const previousMissionQueries = queryClient.getQueriesData<
        InfiniteData<Paginated<Mission>>
      >({ queryKey: missionKeys.all });
      const previousFeedQueries = queryClient.getQueriesData<
        InfiniteData<Paginated<FeedPost>>
      >({ queryKey: feedKeys.all });

      const patch = { isAdded: false, addedPlanId: null };

      queryClient.setQueriesData<InfiniteData<Paginated<Mission>>>(
        { queryKey: missionKeys.all },
        (old) => patchMissionInPages(old, missionId, patch),
      );
      queryClient.setQueriesData<InfiniteData<Paginated<FeedPost>>>(
        { queryKey: feedKeys.all },
        (old) => patchMissionInFeedPages(old, missionId, patch),
      );

      return { previousMissionQueries, previousFeedQueries };
    },
    onError: (_err, _variables, context) => {
      context?.previousMissionQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousFeedQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.all });
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

// 피드 좋아요 토글 (낙관적 업데이트)
export function useToggleFeedLike(tab: FeedTab) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      toggleFeedLike(postId, liked),
    onMutate: async ({ postId, liked }) => {
      // mutation이 pending인 동안 탭이 바뀌면 onError/onSettled 클로저의 tab이 최신 렌더
      // 값으로 교체될 수 있다(react-query MutationObserver.setOptions가 pending mutation의
      // 옵션도 갈아끼움). onMutate 시점에 queryKey를 계산해 context에 담아 반환하고,
      // onError/onSettled는 반드시 이 context.queryKey를 사용해 다른 탭 캐시 오염을 막는다.
      const queryKey = feedKeys.list(tab);

      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<InfiniteData<Paginated<FeedPost>>>(queryKey);

      queryClient.setQueryData<InfiniteData<Paginated<FeedPost>>>(
        queryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      likedByMe: liked,
                      likeCount: post.likeCount + (liked ? 1 : -1),
                    }
                  : post,
              ),
            })),
          };
        },
      );

      return { queryKey, previousData };
    },
    onError: (_err, _variables, context) => {
      if (context && context.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    onSettled: (_data, _err, _variables, context) => {
      if (context) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}

// 참고용 재수출 타입 (호출부 편의)
export type { Mission };
