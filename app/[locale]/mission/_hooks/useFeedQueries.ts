/**
 * @module useFeedQueries
 * 미션 인증 피드 쿼리 키 팩토리 + 훅. 피드 목록 / 좋아요 토글 / 댓글 목록 / 댓글 생성.
 */
"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  createFeedComment,
  fetchFeed,
  fetchFeedComments,
  toggleFeedLike,
} from "@/app/_api/feed";
import type { FeedPost, FeedTab } from "@/app/_api/feed";
import type { Paginated } from "@/app/_api/shared";

export const feedKeys = {
  all: ["missionFeed"] as const,
  list: (tab: FeedTab) => [...feedKeys.all, tab] as const,
  // comments는 의도적으로 all prefix 밖의 독립 루트다. setQueriesData({queryKey: feedKeys.all}, patchFeedPost)
  // 호출부(이 파일의 댓글 생성 onSuccess, useMissionQueries.ts의 미션 추가/해제)가 전부 피드 페이지
  // shape(items: FeedPost[], post.mission.id 접근)만 가정하고 있어, comments를 all 밑으로 옮기면
  // 댓글 캐시(items: FeedComment[])가 같은 patch 함수에 걸려 오염되거나 post.mission이 undefined라
  // TypeError가 난다. 옮기려면 그 호출부들을 먼저 shape-guard(예: 'mission' in item 체크)해야 한다.
  comments: (postId: string) => ["feedComments", postId] as const,
};

type FeedPages = InfiniteData<Paginated<FeedPost>>;

/** 무한 스크롤 캐시의 특정 게시글만 갱신한 새 객체를 돌려준다 (없으면 old 그대로) */
function patchFeedPost(
  old: FeedPages | undefined,
  postId: string,
  update: (post: FeedPost) => FeedPost,
): FeedPages | undefined {
  if (!old || !Array.isArray(old.pages)) return old;
  return {
    ...old,
    pages: old.pages.map((page) => {
      // patchMissionInPages와 같은 방어 — items가 배열이 아니면 패치 대상이 아니다 (throw 시 onMutate 전체 실패)
      if (!Array.isArray(page.items)) return page;
      return {
        ...page,
        items: page.items.map((post) =>
          post.id === postId ? update(post) : post,
        ),
      };
    }),
  };
}

// 미션 인증 피드 (탭별 무한 스크롤). keepPreviousData: 탭 전환 중 이전 목록을 유지해 깜빡임 방지
export function useFeed(tab: FeedTab) {
  return useInfiniteQuery({
    queryKey: feedKeys.list(tab),
    queryFn: ({ pageParam }) => fetchFeed({ tab, cursor: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  });
}

// 피드 좋아요 토글 — 낙관적 flip → 서버 응답으로 재확정 → 실패 시 롤백 → 정리 refetch
export function useToggleFeedLike(tab: FeedTab) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleFeedLike(postId),
    onMutate: async (postId) => {
      // mutation이 pending인 동안 탭이 바뀌면 onError/onSettled 클로저의 tab이 최신 렌더
      // 값으로 교체될 수 있다(react-query MutationObserver.setOptions가 pending mutation의
      // 옵션도 갈아끼움). onMutate 시점에 queryKey를 계산해 context에 담아 반환하고,
      // 이후 콜백은 반드시 이 context.queryKey를 사용해 다른 탭 캐시 오염을 막는다.
      const queryKey = feedKeys.list(tab);
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<FeedPages>(queryKey);

      queryClient.setQueryData<FeedPages>(queryKey, (old) =>
        patchFeedPost(old, postId, (post) => ({
          ...post,
          likedByMe: !post.likedByMe,
          likeCount: post.likeCount + (post.likedByMe ? -1 : 1),
        })),
      );

      return { queryKey, previousData };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    onSuccess: (result) => {
      // 서버가 돌려준 토글 후 상태가 진실. 연타로 낙관값이 어긋났어도 여기서 맞춰진다.
      // 같은 게시글이 latest/popular/weeklyHot 등 여러 탭 캐시에 동시에 존재할 수 있어
      // context.queryKey(활성 탭)만이 아니라 feedKeys.all prefix로 전부 패치한다 —
      // 그러지 않으면 다른 탭으로 전환했을 때 낡은 좋아요 상태가 잠깐 노출된다.
      queryClient.setQueriesData<FeedPages>({ queryKey: feedKeys.all }, (old) =>
        patchFeedPost(old, result.postId, (post) => ({
          ...post,
          likedByMe: result.liked,
          likeCount: result.likeCount,
        })),
      );
    },
    // onSuccess가 이미 모든 탭 캐시를 서버 진실로 재확정했다. latest/completed는 정렬이 좋아요 수와
    // 무관해 onSuccess의 서버 응답 패치로 충분하고 재조회할 필요가 없다. popular/weeklyHot은 정렬
    // 기준이 좋아요 수라 활성 탭만 추가로 invalidate해 순서 변화까지 반영한다.
    onSettled: (_data, _err, _postId, context) => {
      if (context && (tab === "popular" || tab === "weeklyHot")) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}

// 댓글 목록 (댓글 시트가 열렸을 때만 조회)
export function useFeedComments(postId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: feedKeys.comments(postId),
    queryFn: ({ pageParam }) =>
      fetchFeedComments({ postId, cursor: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });
}

// 댓글 생성 — 응답 commentCount로 피드 캐시(모든 탭) 패치 + 댓글 목록 refetch
export function useCreateFeedComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      createFeedComment(postId, content),
    onSuccess: (created) => {
      // 1) 카드의 댓글 수: 게시글은 여러 탭 캐시에 동시에 존재할 수 있어 feedKeys.all prefix로 전부 패치
      queryClient.setQueriesData<FeedPages>({ queryKey: feedKeys.all }, (old) =>
        patchFeedPost(old, created.postId, (post) => ({
          ...post,
          commentCount: created.commentCount,
        })),
      );
      // 2) 댓글 목록: 생성 응답에 author가 없어 캐시에 직접 append할 수 없다 (docs/API-RULE.md 계약 공백 #4).
      //    Promise를 반환하면 mutateAsync가 refetch 완료까지 기다린다 → 호출부는 resolve 직후 목록 맨 아래로 스크롤 가능
      return queryClient.invalidateQueries({
        queryKey: feedKeys.comments(created.postId),
      });
    },
  });
}
