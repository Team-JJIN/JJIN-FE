/**
 * @component CommentSheet
 * 피드 카드의 댓글 버튼으로 여는 댓글 바텀시트 (Figma 630:2111). 제목 "댓글 N개", 댓글 목록(무한 스크롤), 하단 입력바.
 * - 딤/ESC/✕/포커스 트랩/슬라이드 모션은 BottomSheet가 담당. 여기서는 목록 상태와 입력만 다룬다.
 * - 목록은 오래된 순(page 0 = 가장 오래된 댓글). 작성 성공 → useCreateFeedComment가 목록 refetch를 기다린 뒤
 *   resolve하지만, refetch는 "이미 로드된 페이지"만 다시 가져온다. 사용자가 목록 끝까지 스크롤하지 않은
 *   상태(다음 페이지 존재)라면 새 댓글은 아직 로드되지 않은 페이지에 있으므로, resolve 후 남은 페이지를
 *   전부 로드한 뒤 맨 아래로 스크롤한다.
 * - CommentSheetBody key={`${post.id}:${openSeq}`}: 오픈 단위로 입력값·스크롤·쿼리 관찰자를 리셋 (MissionSheet와 같은 이유).
 * - 전송 실패 시 입력값을 유지하고 sendError를 띄운다 (사용자가 바로 재전송할 수 있게).
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import BottomSheet from "@/app/_components/ui/BottomSheet";
import { ArrowUpIcon } from "@/app/_components/icons";
import { fadeSwap, listItemEnter, TAP } from "@/app/_components/motion/tokens";
import { useCommentSheetStore } from "../_store/useCommentSheetStore";
import {
  feedKeys,
  useCreateFeedComment,
  useFeedComments,
} from "../_hooks/useFeedQueries";
import { useInfiniteScroll } from "../_hooks/useInfiniteScroll";
import CommentItem from "./CommentItem";
import type { FeedComment } from "@/app/_api/feed";
import type { Paginated } from "@/app/_api/missions";

/** 서버 계약에 길이 제한이 명시돼 있지 않아 클라이언트 값으로 둔다 (docs/API-RULE.md 계약 공백 #5) */
export const COMMENT_MAX = 200;

/** 댓글 작성 후 다음 페이지를 이어서 로드하는 횟수 상한 (무한 루프 방지 안전장치) */
const MAX_CATCH_UP_FETCHES = 20;

export default function CommentSheet() {
  const t = useTranslations("mission");
  const open = useCommentSheetStore((s) => s.open);
  const post = useCommentSheetStore((s) => s.post);
  const commentCount = useCommentSheetStore((s) => s.commentCount);
  const openSeq = useCommentSheetStore((s) => s.openSeq);
  const close = useCommentSheetStore((s) => s.close);

  if (!post) return null;

  return (
    <BottomSheet
      open={open}
      title={t("feed.comments.title", { count: commentCount })}
      onClose={close}
      closeLabel={t("close")}
      animated
      contentMode="fill"
      heightClass="h-[58%]"
      headerVariant="compact"
    >
      <CommentSheetBody
        key={`${post.id}:${openSeq}`}
        postId={post.id}
        active={open}
      />
    </BottomSheet>
  );
}

interface CommentSheetBodyProps {
  postId: string;
  /** 시트가 열려 있을 때만 댓글을 조회한다 (exit 모션 중 재조회 방지) */
  active: boolean;
}

function CommentSheetBody({ postId, active }: CommentSheetBodyProps) {
  const t = useTranslations("mission");
  const queryClient = useQueryClient();
  const setCommentCount = useCommentSheetStore((s) => s.setCommentCount);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    refetch,
  } = useFeedComments(postId, active);
  const createComment = useCreateFeedComment();

  const comments = useMemo<FeedComment[]>(() => {
    const all = data?.pages.flatMap((page) => page.items) ?? [];
    // 커서 페이지네이션 중 새 댓글이 끼어들면 같은 댓글이 두 페이지에 걸쳐 올 수 있어 id로 중복 제거한다
    const seen = new Set<string>();
    return all.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, [data]);

  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    enabled: active && !!hasNextPage && !isFetchingNextPage && !isError,
    rootRef: listRef,
  });

  const [content, setContent] = useState("");
  const trimmed = content.trim();
  const canSubmit = trimmed.length > 0 && !createComment.isPending;

  /** 캐치업 로드가 끝나면 true — comments가 커밋된 뒤 도는 아래 이펙트가 소비하고 리셋한다 */
  const pendingScrollRef = useRef(false);
  /** 언마운트 후에는 캐치업 루프를 이어가거나 스토어에 쓰지 않기 위한 가드 */
  const cancelledRef = useRef(false);
  useEffect(() => {
    cancelledRef.current = false; // StrictMode 이중 마운트(mount→cleanup→mount)에서 cleanup이 세운 true를 되돌린다
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  // 캐치업 루프 직후(마이크로태스크 재개 시점)에 곧바로 scrollTo하면 새로 로드된 댓글이 아직
  // 커밋되지 않은 시점의 scrollHeight를 잴 수 있다 — react-query 옵저버 알림은 setTimeout(0)으로
  // 배치되므로 await 재개 시점엔 리렌더가 반영되기 전이다. 대신 플래그만 세워두고, comments가
  // 실제로 커밋된 뒤 도는 이 이펙트에서 최신 scrollHeight로 스크롤한다.
  useEffect(() => {
    if (!pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [comments]);

  // 리렌더에 의존하는 ref/state로는 mutateAsync resolve 직후(비동기) 시점의 최신 hasNextPage를
  // 보장할 수 없다 — react-query의 옵저버 알림(notifyManager)은 배치돼 비동기로 리렌더를
  // 트리거하므로, 그 리렌더를 기다리는 useEffect가 아직 안 돈 시점일 수 있다(stale).
  // 반면 캐시(queryClient.setQueryData)는 fetch가 resolve되는 즉시 동기적으로 갱신되므로,
  // 캐시를 직접 읽으면 리렌더를 기다리지 않고 그 시점의 실제 상태를 알 수 있다.
  // useFeedQueries.ts의 getNextPageParam: (lastPage) => lastPage.nextCursor 와 짝이다 —
  // 커서 판단 규칙이 바뀌면 이 nextCursor != null 판정도 함께 바꿔야 한다.
  const hasMoreInCache = useCallback(() => {
    const cached = queryClient.getQueryData<
      InfiniteData<Paginated<FeedComment>>
    >(feedKeys.comments(postId));
    const lastPage = cached?.pages[cached.pages.length - 1];
    return lastPage?.nextCursor != null;
  }, [queryClient, postId]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!canSubmit) return;
      try {
        const created = await createComment.mutateAsync({
          postId,
          content: trimmed,
        });
        // 대기 중 스토어의 post가 다른 게시글로 바뀌었을 수 있다 — 그때 이 카운트로
        // (이미 다른 게시글을 보여주는) 시트 제목을 덮어쓰지 않는다. 언마운트 후에도 스킵.
        if (
          !cancelledRef.current &&
          useCommentSheetStore.getState().post?.id === postId
        ) {
          setCommentCount(created.commentCount);
        }
        setContent("");

        // 이미 로드된 페이지는 refetch로 최신화됐지만, 아직 로드하지 않은 다음 페이지에
        // 새 댓글이 있을 수 있다 — 끝까지 이어서 로드한다. 판단은 항상 캐시(hasMoreInCache)로
        // 한다 — fetchNextPage()도 내부적으로 캐시를 동기 갱신하므로 반환값을 별도로 볼 필요는
        // 없지만, retry: false라 요청이 실패하면 다음 반복도 곧장 실패해 20회를 버스트로 소모할
        // 수 있으므로 실패 시 즉시 중단한다.
        for (
          let i = 0;
          !cancelledRef.current && hasMoreInCache() && i < MAX_CATCH_UP_FETCHES;
          i++
        ) {
          const result = await fetchNextPage();
          if (result.isError) break;
        }

        // 스크롤은 여기서 바로 하지 않는다 — 위 pendingScrollRef 이펙트가 comments 커밋 뒤
        // 최신 scrollHeight로 스크롤한다. 언마운트 후에는 플래그도 세우지 않는다.
        if (!cancelledRef.current) {
          pendingScrollRef.current = true;
        }
      } catch {
        // 실패: 입력값 유지, createComment.isError로 안내 문구 표시
      }
    },
    [
      canSubmit,
      createComment,
      postId,
      trimmed,
      setCommentCount,
      fetchNextPage,
      hasMoreInCache,
    ],
  );

  return (
    <div className="flex h-full flex-col">
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto overscroll-contain p-[16px]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isError ? (
            <motion.div
              key="error"
              {...fadeSwap}
              className="flex flex-col items-center justify-center gap-3 py-12"
            >
              <p className="text-[13px] font-medium text-subtext">
                {t("errorLoad")}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-full bg-dark px-4 py-2 text-[12px] font-semibold text-white transition duration-150 motion-safe:active:scale-[0.96]"
              >
                {t("retry")}
              </button>
            </motion.div>
          ) : isPending ? (
            <motion.div
              key="pending"
              {...fadeSwap}
              className="flex items-center justify-center py-12"
            >
              <div
                aria-hidden="true"
                className="size-8 animate-spin rounded-full border-[3px] border-surface border-t-dark"
              />
            </motion.div>
          ) : comments.length === 0 ? (
            <motion.div
              key="empty"
              {...fadeSwap}
              className="flex items-center justify-center py-12"
            >
              <p className="text-[13px] font-medium text-subtext">
                {t("feed.comments.empty")}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              {...fadeSwap}
              className="flex flex-col gap-[16px]"
            >
              {comments.map((comment, index) => (
                <motion.div key={comment.id} {...listItemEnter(index)}>
                  <CommentItem comment={comment} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 센티널은 AnimatePresence 밖 — 상태 교체 애니메이션과 무관하게 항상 목록 끝에 있어야 한다 */}
        <div ref={sentinelRef} />
        {isFetchingNextPage && (
          <p className="py-3 text-center text-[12px] text-muted">...</p>
        )}
      </div>

      {createComment.isError && (
        <p
          role="alert"
          className="px-[16px] pb-[6px] text-[12px] font-medium text-error"
        >
          {t("feed.comments.sendError")}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex h-[64px] shrink-0 items-center gap-[8px] border-t border-line bg-white px-[16px] py-[12px]"
      >
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={COMMENT_MAX}
          placeholder={t("feed.comments.placeholder")}
          aria-label={t("feed.comments.inputLabel")}
          enterKeyHint="send"
          className="h-[40px] min-w-0 flex-1 rounded-[14px] bg-surface px-[12px] text-[14px] font-medium text-ink placeholder:text-muted focus:outline-none"
        />
        <motion.button
          type="submit"
          disabled={!canSubmit}
          aria-label={t("feed.comments.send")}
          whileTap={canSubmit ? TAP.icon : undefined}
          className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-dark text-lime-vivid transition-colors disabled:bg-surface disabled:text-muted"
        >
          <ArrowUpIcon size={24} />
        </motion.button>
      </form>
    </div>
  );
}
