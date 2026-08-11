/**
 * @component MissionCardBig
 * 미션 추천 탭의 미션 카드(mission/box/big). 상단 이미지, 제목 + 추가 토글 버튼,
 * 2줄 클램프 설명, 해시태그 칩, 우하단 난이도 별을 표시한다.
 */
"use client";

import { useCallback } from "react";
import { CameraIcon } from "@/app/_components/icons";
import AddToggleButton from "./AddToggleButton";
import DifficultyStars from "./DifficultyStars";
import type { Mission } from "@/app/_api/missions";

interface MissionCardBigProps {
  mission: Mission;
  onAddClick: (mission: Mission) => void;
}

export default function MissionCardBig({
  mission,
  onAddClick,
}: MissionCardBigProps) {
  const handleAddClick = useCallback(() => {
    onAddClick(mission);
  }, [mission, onAddClick]);

  return (
    <div className="w-full rounded-[20px] bg-white px-[13px] py-[17px] shadow-[0px_6px_11px_0px_rgba(23,23,23,0.09)]">
      <div className="relative h-[185px] w-full overflow-hidden rounded-[12px] bg-surface">
        {mission.imageUrl ? (
          <img
            src={mission.imageUrl}
            alt={mission.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CameraIcon size={32} className="text-muted" />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="line-clamp-1 text-[17px] font-semibold leading-[1.4] tracking-[-0.085px] text-ink">
              {mission.title}
            </h3>
            <AddToggleButton
              isAdded={mission.isAdded}
              onClick={handleAddClick}
            />
          </div>

          {/* 디자인은 설명 2줄 높이를 항상 예약 — 1줄이어도 카드 비율 유지 */}
          <p className="line-clamp-2 min-h-[38.4px] text-[12px] font-medium leading-[1.6] text-subtext">
            {mission.description}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {mission.hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface px-3 py-1 text-[12px] font-medium leading-[1.6] text-subtext"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex h-[24px] items-center justify-end">
          <DifficultyStars difficulty={mission.difficulty} />
        </div>
      </div>
    </div>
  );
}
