/**
 * @component MissionDetailPanel
 * 미션 상세 정보 화면. MissionSheet(바텀시트) 안의 한 스텝으로만 쓰이는 순수 콘텐츠라
 * 딤·포커스트랩·ESC·✕는 전부 셸(BottomSheet)이 책임지고 여기서는 다루지 않는다.
 * '+ 추가' 탭은 onAddClick으로 올려보내고, 같은 시트 안에서 추가 화면으로 슬라이드 전환된다
 * (예전 중앙 팝업처럼 딤이 중첩될 일이 없어 exit 완료를 기다리는 지연 처리도 사라졌다).
 * 레이아웃(Figma 685:2251): 제목은 시트 헤더(TopBarClose)가 맡고, 본문은
 * 이미지(343×387 비율) → [난이도 | 추가] → 설명 → 해시태그 순으로 17/21/16px 간격을 둔다.
 * 해시태그 칩은 MissionCardBig과 같은 클래스를 쓴다.
 */
"use client";

import { CameraIcon } from "@/app/_components/icons";
import AddToggleButton from "./AddToggleButton";
import DifficultyStars from "./DifficultyStars";
import type { MissionDetail } from "@/app/_api/missions";

interface MissionDetailPanelProps {
  detail: MissionDetail;
  onAddClick: () => void;
}

export default function MissionDetailPanel({
  detail,
  onAddClick,
}: MissionDetailPanelProps) {
  return (
    <div className="h-full overflow-y-auto overscroll-contain scrollbar-hide px-[20px] pb-8">
      {/* 이미지: 디자인 실측 343×387 (r12). 고정 높이 대신 비율로 잡아 시트 폭에 따라 같이 커진다 */}
      <div className="relative aspect-[343/387] w-full overflow-hidden rounded-[12px] bg-surface">
        {detail.imageUrl ? (
          <img
            src={detail.imageUrl}
            alt={detail.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CameraIcon size={32} className="text-muted" />
          </div>
        )}
      </div>

      {/* 난이도(좌) | 추가(우) — 제목은 시트 헤더로 올라갔으므로 본문의 첫 행은 메타 정보다 */}
      <div className="mt-[17px] flex items-center justify-between gap-2">
        <DifficultyStars difficulty={detail.difficulty} />
        <AddToggleButton isAdded={detail.isAdded} onClick={onAddClick} />
      </div>

      <p className="mt-[21px] whitespace-pre-line text-[12px] font-medium leading-[1.6] text-subtext">
        {detail.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {detail.hashtags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-surface px-3 py-1 text-[12px] font-medium text-subtext"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
