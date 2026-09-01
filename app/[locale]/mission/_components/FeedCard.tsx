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
import { HeartIcon, CommentIcon, SparkleIcon } from "@/app/_components/icons";
import Avatar from "@/app/_components/ui/Avatar";
import { heartPop, TAP } from "@/app/_components/motion/tokens";
import DifficultyStars from "./DifficultyStars";
import AddToggleButton from "./AddToggleButton";
import type { FeedPost } from "@/app/_api/feed";
import type { Mission } from "@/app/_api/missions";

interface FeedCardProps {
  post: FeedPost;
  onLikeToggle: (post: FeedPost) => void;
  onCommentClick: (post: FeedPost) => void;
  onAddClick: (mission: Mission) => void;
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
      <div className="flex w-full items-center gap-[9px] px-[20px]">
        {/* 닉네임이 바로 옆에 텍스트로 있으므로 아바타는 장식 */}
        <Avatar src={post.author.avatarUrl} alt="" size={40} />
        <div className="flex flex-col gap-px">
          <span className="text-[15px] font-semibold tracking-[-0.045px] text-ink">
            {post.author.nickname}
          </span>
          <span className="text-[12px] font-medium text-muted">
            {t("feed.weeklyClear", {
              count: post.mission.weeklyCompletedCount,
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
            className={`flex transition-colors ${post.likedByMe ? "text-error" : "text-ink"}`}
          >
            <motion.span
              variants={heartPop}
              initial={false}
              animate={post.likedByMe ? "liked" : "idle"}
              className="flex"
            >
              {/* 레이아웃 박스는 24px 유지, 시각 크기만 26px(×1.0833)로 살짝 확대.
                  motion.span의 heartPop이 transform을 덮어쓰므로 SVG에만 적용 */}
              <HeartIcon size={24} className="scale-[1.0833]" />
            </motion.span>
          </motion.button>
          <motion.button
            type="button"
            onClick={handleCommentClick}
            aria-haspopup="dialog"
            aria-label={t("feed.commentButton", { count: post.commentCount })}
            whileTap={TAP.icon}
            className="flex text-ink"
          >
            <CommentIcon size={24} />
          </motion.button>
        </div>

        <div className="flex w-full flex-col items-start gap-[5px]">
          <p className="text-[15px] font-semibold tracking-[-0.045px] text-ink">
            {t("feed.likeCount", { count: post.likeCount })}
          </p>
          <p className="text-[14px] font-medium leading-[1.6] text-muted">
            {post.content}
          </p>

          {/* 하단 미션 요약 카드 */}
          <div className="mt-1 flex w-full items-center justify-between gap-3 rounded-[16px] bg-white px-[21px] py-[11px] shadow-[0px_5px_9px_0px_rgba(23,23,23,0.08)]">
            <div className="flex min-w-0 items-center gap-[24px]">
              {post.mission.imageUrl ? (
                <img
                  src={post.mission.imageUrl}
                  alt={post.mission.title}
                  className="size-[35px] shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-[35px] shrink-0 items-center justify-center rounded-full bg-lime-pale">
                  <SparkleIcon size={20} className="text-lime-vivid" />
                </div>
              )}
              <div className="flex min-w-0 flex-col gap-[2px]">
                <h3 className="line-clamp-2 text-[15px] font-semibold tracking-[-0.045px] text-ink">
                  {post.mission.title}
                </h3>
                <DifficultyStars difficulty={post.mission.difficulty} />
              </div>
            </div>
            <AddToggleButton
              isAdded={post.mission.isAdded}
              onClick={handleAddClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
