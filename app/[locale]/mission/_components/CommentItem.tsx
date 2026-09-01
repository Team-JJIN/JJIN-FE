/**
 * @component CommentItem
 * 댓글 한 줄: 아바타(40) + [닉네임 · timeAgo] + 본문. Figma 630:2584 Comment Item.
 * timeAgo는 createdAt으로 클라이언트가 계산한다 (1분 미만은 i18n "방금 전").
 */
"use client";

import { useTranslations } from "next-intl";
import Avatar from "@/app/_components/ui/Avatar";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { formatTimeAgo } from "@/app/_lib/timeAgo";
import type { FeedComment } from "@/app/_api/feed";

interface CommentItemProps {
  comment: FeedComment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const t = useTranslations("mission");
  const locale = useLocale();
  const timeAgo =
    formatTimeAgo(comment.createdAt, locale) ?? t("feed.comments.justNow");

  return (
    <div className="flex items-start gap-[8px]">
      {/* 닉네임이 바로 옆에 텍스트로 있으므로 아바타는 장식 */}
      <Avatar src={comment.author.avatarUrl} alt="" size={40} />
      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <div className="flex items-center gap-[6px]">
          <span className="text-[15px] font-semibold tracking-[-0.045px] text-ink">
            {comment.author.nickname}
          </span>
          <span className="text-[12px] font-medium leading-[1.6] text-muted">
            {timeAgo}
          </span>
        </div>
        <p className="whitespace-pre-wrap break-words text-[14px] font-medium leading-[1.6] text-ink">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
