/**
 * @component FeedCard
 * 미션 인증 피드 카드. 작성자 정보, 인증 사진(좌우 풀블리드), 좋아요/댓글 액션,
 * 게시글 본문, 하단 미션 요약 카드(추가/해제 토글 포함)로 구성된다.
 * 좋아요 하트는 heartPop(켜질 때만 펄스), 댓글 버튼은 댓글 바텀시트를 연다.
 */
"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  HeartIcon,
  HeartOutlineIcon,
  CommentIcon,
  SparkleIcon,
} from "@/app/_components/icons";
import Avatar from "@/app/_components/ui/Avatar";
import { heartPop, TAP } from "@/app/_components/motion/tokens";
import DifficultyStars from "./DifficultyStars";
import AddToggleButton from "./AddToggleButton";
import type { FeedPost, FeedMissionSummary } from "@/app/_api/feed";

interface FeedCardProps {
  post: FeedPost;
  onLikeToggle: (post: FeedPost) => void;
  onCommentClick: (post: FeedPost) => void;
  onAddClick: (mission: FeedMissionSummary) => void;
}

export default function FeedCard({
  post,
  onLikeToggle,
  onCommentClick,
  onAddClick,
}: FeedCardProps) {
  const t = useTranslations("mission");

  const handleLikeToggle = useCallback(() => {
    onLikeToggle(post);
  }, [post, onLikeToggle]);

  const handleCommentClick = useCallback(() => {
    onCommentClick(post);
  }, [post, onCommentClick]);

  const handleAddClick = useCallback(() => {
    onAddClick(post.mission);
  }, [post.mission, onAddClick]);

  return (
    <div className="flex w-full flex-col items-center gap-[10px] border-b border-surface pt-[8px] pb-[20px] last:border-b-0">
      <div className="flex w-full items-center gap-[9px] px-[13px]">
        {/* 닉네임이 바로 옆에 텍스트로 있으므로 아바타는 장식 */}
        <Avatar src={post.author.avatarUrl} alt="" size={40} />
        <div className="flex flex-col gap-px">
          <span className="text-[15px] font-semibold leading-[1.4] tracking-[-0.045px] text-ink">
            {post.author.nickname}
          </span>
          <span className="text-[12px] font-medium leading-[1.6] text-muted">
            {t.rich("feed.weeklyClear", {
              count: post.mission.weeklyCompletedCount,
              highlight: (chunks) => (
                <span className="text-subtext">{chunks}</span>
              ),
            })}
          </span>
        </div>
      </div>

      {/* 인증 사진 — 좌우 풀블리드(패딩 없이 컨테이너 폭 전체), 1:1 비율 */}
      {/* alt="" 장식 처리 — 바로 아래 post.content가 본문 텍스트로 중복 표시되므로 */}
      <img
        src={post.imageUrl}
        alt=""
        className="aspect-square w-full object-cover"
      />

      <div className="flex w-full flex-col gap-[8px] px-[20px]">
        <div className="flex items-center gap-[14px]">
          <motion.button
            type="button"
            onClick={handleLikeToggle}
            aria-pressed={post.likedByMe}
            aria-label={t("feed.likeCount", { count: post.likeCount })}
            whileTap={TAP.icon}
            className={`flex transition-colors ${post.likedByMe ? "text-error" : "text-[#9B9B9B]"}`}
          >
            <motion.span
              variants={heartPop}
              initial={false}
              animate={post.likedByMe ? "liked" : "idle"}
              className="flex"
            >
              {post.likedByMe ? (
                <HeartIcon size={24} />
              ) : (
                <HeartOutlineIcon size={24} />
              )}
            </motion.span>
          </motion.button>
          <motion.button
            type="button"
            onClick={handleCommentClick}
            aria-haspopup="dialog"
            aria-label={t("feed.commentButton", { count: post.commentCount })}
            whileTap={TAP.icon}
            className="flex text-[#9B9B9B]"
          >
            <CommentIcon size={24} />
          </motion.button>
        </div>

        <div className="flex w-full flex-col items-start gap-[5px]">
          <p className="text-[15px] font-semibold leading-[1.4] tracking-[-0.045px] text-ink">
            {t("feed.likeCount", { count: post.likeCount })}
          </p>
          <p className="text-[14px] font-medium leading-[1.6] text-muted">
            {post.content}
          </p>

          {/* 하단 미션 요약 카드 */}
          <div className="mt-1 flex w-full items-center justify-between gap-3 rounded-[16px] bg-white px-[21px] py-[11px] shadow-[0px_5px_9px_0px_rgba(23,23,23,0.08)]">
            <div className="flex min-w-0 items-center gap-[24px]">
              {/* 피그마 mission/box/small 고정 아이콘 — 배경 없는 35px 별 */}
              <SparkleIcon size={35} className="shrink-0 text-lime-vivid" />
              <div className="flex min-w-0 max-w-[147px] flex-col">
                <h3 className="line-clamp-2 text-[15px] font-semibold leading-[1.4] tracking-[-0.045px] text-ink">
                  {post.mission.title}
                </h3>
                <DifficultyStars difficulty={post.mission.difficulty} />
              </div>
            </div>
            {/* 서버 피드 mission 요약에 isAdded가 없어(BE 확인 필요, plan §6-5) 추가 상태 없이 시트만 연다 */}
            <AddToggleButton isAdded={false} onClick={handleAddClick} />
          </div>
        </div>
      </div>
    </div>
  );
}
