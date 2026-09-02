/**
 * @store useCommentSheetStore
 * 피드 댓글 바텀시트(CommentSheet)의 상태. useMissionSheetStore와 같은 규칙:
 * - close()는 open만 내리고 postId는 유지한다 — 시트가 내려가는 exit 모션 동안 콘텐츠가 사라지면 안 된다.
 * - openSeq는 열 때마다 +1. CommentSheet가 key에 섞어 오픈 단위로 입력값·스크롤을 리셋한다.
 * - commentCount는 제목 "댓글 N개"용. 연 시점의 post.commentCount로 시작하고, 댓글 작성 성공 시
 *   서버 응답 commentCount로 갱신한다 (피드 캐시를 시트가 따로 구독하지 않는 이유: 오버레이 호스트는
 *   미션 홈에도 마운트되므로 피드 쿼리 관찰자를 만들면 홈에서 피드를 불러오게 된다).
 * - post 전체 대신 postId만 보관하는 이유는 useMissionSheetStore의 missionId/preview와 같다:
 *   서버 상태(FeedPost)의 사본을 Zustand에 두지 않고 진실 원천을 피드 쿼리 캐시 하나로 유지한다.
 */
"use client";

import { create } from "zustand";

interface CommentSheetState {
  open: boolean;
  /** 댓글을 보는 게시글 id. close() 후에도 유지 (exit 모션 중 콘텐츠 보존) */
  postId: string | null;
  /** 시트 제목의 N */
  commentCount: number;
  openSeq: number;
  openComments: (postId: string, commentCount: number) => void;
  setCommentCount: (count: number) => void;
  close: () => void;
}

export const useCommentSheetStore = create<CommentSheetState>((set) => ({
  open: false,
  postId: null,
  commentCount: 0,
  openSeq: 0,
  openComments: (postId, commentCount) =>
    set((s) => ({
      open: true,
      postId,
      commentCount,
      openSeq: s.openSeq + 1,
    })),
  setCommentCount: (commentCount) => set({ commentCount }),
  close: () => set({ open: false }),
}));
