/**
 * @component MissionCardBig
 * 미션 추천 탭의 미션 카드(mission/box/big). 상단 이미지, 제목 + 추가 토글 버튼,
 * 2줄 클램프 설명, 해시태그 칩, 우하단 난이도 별을 표시한다.
 * 카드 본문 전체를 role="button" tabIndex={0} 래퍼로 묶어 클릭·키보드(Enter/Space)로
 * 상세 시트를 열고, 추가 버튼 탭은 이벤트 전파를 막아 상세 시트와 분리된다.
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
  onSelect: (mission: Mission) => void;
}

export default function MissionCardBig({
  mission,
  onAddClick,
  onSelect,
}: MissionCardBigProps) {
  const handleAddClick = useCallback(() => {
    onAddClick(mission);
  }, [mission, onAddClick]);

  const handleSelect = useCallback(() => {
    onSelect(mission);
  }, [mission, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // 내부 추가 버튼(button)에 포커스한 채 Enter/Space를 누르면 keydown이 여기까지 버블링된다.
      // 카드 자신이 대상일 때만 처리해야 추가 버튼 활성화가 상세 시트로 바뀌지 않는다.
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelect();
      }
    },
    [handleSelect],
  );

  return (
    <div
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={mission.title}
      className="w-full cursor-pointer rounded-[20px] bg-white px-[13px] py-[17px] shadow-[0px_6px_22px_0px_rgba(23,23,23,0.09)]"
    >
      {/* button 안에 AddToggleButton(button)을 두면 무효한 HTML 중첩이 되므로 div로 감싼다 */}
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
