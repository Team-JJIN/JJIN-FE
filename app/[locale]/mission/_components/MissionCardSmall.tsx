/**
 * @component MissionCardSmall
 * 검색 결과 그리드용 미션 카드(mission/box/small). 정사각형 썸네일 위에 좌상단 난이도 배지와
 * 우하단 추가 토글 버튼을 겹쳐 배치하고, 2줄 클램프 제목과 해시태그 칩을 아래에 표시한다.
 * 카드 본문(썸네일+제목) 전체를 role="button" tabIndex={0} 래퍼 하나로 묶어 클릭·키보드
 * (Enter/Space) 모두로 상세 팝업을 열 수 있게 한다. 추가 버튼 탭은 이벤트 전파를 막아
 * 상세 팝업과 분리된다.
 */
"use client";

import { useCallback } from "react";
import { CameraIcon, StarIcon } from "@/app/_components/icons";
import AddToggleButton from "./AddToggleButton";
import type { Mission } from "@/app/_api/missions";

interface MissionCardSmallProps {
  mission: Mission;
  onAddClick: (mission: Mission) => void;
  onSelect: (mission: Mission) => void;
}

export default function MissionCardSmall({
  mission,
  onAddClick,
  onSelect,
}: MissionCardSmallProps) {
  const handleAddClick = useCallback(() => {
    onAddClick(mission);
  }, [mission, onAddClick]);

  const handleSelect = useCallback(() => {
    onSelect(mission);
  }, [mission, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
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
      className="flex cursor-pointer flex-col gap-[9px]"
    >
      {/* button 안에 AddToggleButton(button)을 두면 무효한 HTML 중첩이 되므로 div로 감싼다 */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[16px] bg-surface">
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

        <div className="absolute left-[9px] top-[9px] flex h-[27px] items-center rounded-full bg-dark/60 px-[5px]">
          <div className="flex items-center">
            {Array.from({ length: mission.difficulty }).map((_, i) => (
              <StarIcon key={i} size={16} className="text-white" />
            ))}
          </div>
        </div>

        <div className="absolute bottom-[8px] right-[8px]">
          <AddToggleButton
            isAdded={mission.isAdded}
            onClick={handleAddClick}
            size="small"
          />
        </div>
      </div>

      <div className="flex flex-col gap-[7px]">
        <h3 className="line-clamp-2 text-[15px] font-semibold tracking-[-0.045px] text-ink">
          {mission.title}
        </h3>
        <div className="flex flex-wrap items-center gap-[5px]">
          {mission.hashtags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface px-3 py-1 text-[12px] font-medium text-subtext"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
