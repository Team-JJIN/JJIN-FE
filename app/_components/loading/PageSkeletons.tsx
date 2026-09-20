"use client";

import {
  type PageSkeletonProps,
  SkeletonBlock,
  SkeletonStatus,
} from "./SkeletonPrimitives";

function HomeContent() {
  return (
    <div className="-mx-[20px] mt-[9px] flex-1 overflow-hidden px-[20px] pb-[96px]">
      <div className="flex flex-col gap-[14px]">
        {["plan-a", "plan-b", "plan-c"].map((key) => (
          <div
            key={key}
            className="rounded-[16px] bg-white py-[14px] shadow-[0px_2px_12px_0px_rgba(23,23,23,0.06)]"
          >
            <SkeletonBlock className="mx-[15px] h-6 w-2/3 rounded" />
            <SkeletonBlock className="mx-[15px] mt-[6px] h-4 w-2/5 rounded" />
            <SkeletonBlock className="mx-[15px] mt-1 h-4 w-1/3 rounded" />
            <SkeletonBlock className="mx-[15px] mt-1 h-4 w-3/5 rounded" />
            <div className="mx-[15px] mt-[9px] h-px bg-line" />
            <div className="mt-[14px] flex items-center justify-between px-[15px]">
              <SkeletonBlock className="h-[29px] w-[88px] rounded-full" />
              <SkeletonBlock className="h-4 w-14 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeSkeleton({ contentOnly = false }: PageSkeletonProps) {
  if (contentOnly)
    return (
      <SkeletonStatus className="flex flex-1 flex-col">
        <HomeContent />
      </SkeletonStatus>
    );

  return (
    <SkeletonStatus>
      <div className="flex h-dvh flex-col bg-white px-[20px]">
        <div className="flex items-center justify-between pb-4 pt-[32px]">
          <SkeletonBlock className="h-[27px] w-16 rounded" />
          <SkeletonBlock className="size-6 rounded-full" />
        </div>
        <HomeContent />
      </div>
    </SkeletonStatus>
  );
}

function MissionHomeCards() {
  return (
    <div className="flex flex-col gap-[22px]">
      {["mission-a", "mission-b"].map((key) => (
        <div
          key={key}
          className="w-full rounded-[20px] bg-white px-[13px] py-[17px] shadow-[0px_6px_22px_0px_rgba(23,23,23,0.09)]"
        >
          <SkeletonBlock className="h-[185px] w-full rounded-[12px]" />
          <div className="mt-4 flex flex-col">
            <div className="flex flex-col gap-4">
              <div className="flex h-8 items-center justify-between gap-2">
                <SkeletonBlock className="h-6 w-3/5 rounded" />
                <SkeletonBlock className="size-8 shrink-0 rounded-full" />
              </div>
              <div className="flex gap-2">
                <SkeletonBlock className="h-[27px] w-[72px] rounded-full" />
                <SkeletonBlock className="h-[27px] w-[92px] rounded-full" />
              </div>
            </div>
            <div className="flex h-6 items-center justify-end gap-1">
              {["star-a", "star-b", "star-c"].map((star) => (
                <SkeletonBlock key={star} className="size-3 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MissionFeedCards() {
  return (
    <div className="flex flex-col">
      {["feed-a", "feed-b"].map((key) => (
        <div
          key={key}
          className="flex w-full flex-col items-center gap-[10px] border-b border-surface pb-[20px] pt-[8px]"
        >
          <div className="flex w-full items-center gap-[9px] px-[13px]">
            <SkeletonBlock className="size-10 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <SkeletonBlock className="h-5 w-1/3 rounded" />
              <SkeletonBlock className="h-4 w-2/5 rounded" />
            </div>
          </div>
          <SkeletonBlock className="aspect-square w-full" />
          <div className="flex w-full flex-col gap-2 px-[20px]">
            <div className="flex h-6 items-center gap-[14px]">
              <SkeletonBlock className="size-6 rounded-full" />
              <SkeletonBlock className="size-6 rounded-full" />
            </div>
            <SkeletonBlock className="h-5 w-1/4 rounded" />
            <SkeletonBlock className="h-4 w-full rounded" />
            <SkeletonBlock className="h-4 w-4/5 rounded" />
            <div className="mt-1 flex min-h-[57px] w-full items-center justify-between gap-3 rounded-[16px] bg-white px-[21px] py-[11px] shadow-[0px_5px_9px_0px_rgba(23,23,23,0.08)]">
              <div className="flex min-w-0 flex-1 items-center gap-6">
                <SkeletonBlock className="size-[35px] shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <SkeletonBlock className="h-5 w-4/5 rounded" />
                  <SkeletonBlock className="mt-1 h-3 w-16 rounded" />
                </div>
              </div>
              <SkeletonBlock className="size-8 shrink-0 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MissionHomeContent() {
  return (
    <div className="-mx-[20px] flex-1 overflow-hidden px-[20px] pb-[96px] pt-[15px]">
      <MissionHomeCards />
    </div>
  );
}

export function MissionHomeSkeleton({
  contentOnly = false,
}: PageSkeletonProps) {
  if (contentOnly)
    return (
      <SkeletonStatus className="flex min-h-0 flex-1 flex-col">
        <MissionHomeCards />
      </SkeletonStatus>
    );

  return (
    <SkeletonStatus>
      <div className="flex h-dvh flex-col bg-white px-[20px]">
        <div className="flex items-center justify-between pb-4 pt-[32px]">
          <SkeletonBlock className="h-[27px] w-20 rounded" />
          <SkeletonBlock className="size-6 rounded-full" />
        </div>
        <SkeletonBlock className="h-[44px] w-full rounded-[14px]" />
        <div className="flex gap-[5px] overflow-hidden py-5">
          {["filter-a", "filter-b", "filter-c", "filter-d"].map((key) => (
            <SkeletonBlock
              key={key}
              className="h-6 w-16 shrink-0 rounded-full"
            />
          ))}
        </div>
        <MissionHomeContent />
      </div>
    </SkeletonStatus>
  );
}

export function MissionFeedSkeleton({
  contentOnly = false,
}: PageSkeletonProps) {
  if (contentOnly)
    return (
      <SkeletonStatus>
        <MissionFeedCards />
      </SkeletonStatus>
    );

  return (
    <SkeletonStatus>
      <div className="flex h-dvh flex-col bg-white">
        <div className="flex items-center justify-between px-[20px] pb-4 pt-[32px]">
          <SkeletonBlock className="h-[27px] w-24 rounded" />
          <SkeletonBlock className="size-6 rounded-full" />
        </div>
        <div className="flex gap-4 overflow-hidden border-b border-line px-[20px] pb-3 pt-2">
          {["tab-a", "tab-b", "tab-c", "tab-d"].map((key) => (
            <SkeletonBlock key={key} className="h-5 w-14 shrink-0 rounded" />
          ))}
        </div>
        <div className="mt-[15px] flex-1 overflow-hidden pb-[96px]">
          <MissionFeedCards />
        </div>
      </div>
    </SkeletonStatus>
  );
}

function ScheduleContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-4">
      <SkeletonBlock className="h-[27px] w-full rounded-full" />
      <div className="flex min-h-0 flex-1 flex-col gap-[21px]">
        <SkeletonBlock className="h-[196px] w-full shrink-0 rounded-2xl" />
        <div className="flex min-h-0 flex-1 flex-col gap-[10px]">
          <SkeletonBlock className="h-[21px] w-full rounded" />
          <div className="flex min-h-0 flex-1 flex-col gap-[19px] overflow-hidden pt-1">
            {["w-full", "w-[92%]", "w-[84%]"].map((width) => (
              <SkeletonBlock
                key={width}
                className={`${width} h-[86px] shrink-0 rounded-[14px]`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScheduleSkeleton({ contentOnly = false }: PageSkeletonProps) {
  if (contentOnly)
    return (
      <SkeletonStatus className="flex min-h-0 flex-1 flex-col">
        <ScheduleContent />
      </SkeletonStatus>
    );

  return (
    <SkeletonStatus>
      <div className="flex h-dvh min-h-0 flex-col bg-white">
        <div className="flex h-[52px] shrink-0 items-center gap-4 px-4 py-3">
          <SkeletonBlock className="size-6 rounded-full" />
          <SkeletonBlock className="h-5 w-1/2 rounded" />
        </div>
        <ScheduleContent />
      </div>
    </SkeletonStatus>
  );
}

export function RecommendationSkeleton() {
  return (
    <div className="flex gap-[19px] overflow-hidden px-4 pb-1">
      {["recommendation-a", "recommendation-b"].map((key) => (
        <div
          key={key}
          className="w-[220px] shrink-0 overflow-hidden rounded-[14px] bg-surface"
        >
          <SkeletonBlock className="h-[122px] w-full" />
          <div className="flex h-[136px] flex-col px-3 pb-3 pt-2">
            <SkeletonBlock className="h-4 w-3/4 rounded" />
            <SkeletonBlock className="mt-2 h-3 w-full rounded" />
            <SkeletonBlock className="mt-1 h-3 w-2/3 rounded" />
            <div className="mt-auto flex items-center justify-between">
              <SkeletonBlock className="h-3 w-16 rounded" />
              <SkeletonBlock className="size-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MissionListSkeleton() {
  return (
    <div className="flex flex-col gap-7 px-4 pt-4">
      {["mission-a", "mission-b"].map((key) => (
        <div
          key={key}
          className="rounded-[14px] bg-white p-[14px] shadow-[0_2px_6px_rgba(23,23,23,0.06)]"
        >
          <div className="flex items-start gap-[11px]">
            <SkeletonBlock className="size-[65px] shrink-0 rounded-[10px]" />
            <div className="min-w-0 flex-1 pt-1">
              <SkeletonBlock className="h-4 w-3/4 rounded" />
              <SkeletonBlock className="mt-2 h-3 w-full rounded" />
              <SkeletonBlock className="mt-1 h-3 w-2/3 rounded" />
              <SkeletonBlock className="mt-2 h-3 w-16 rounded" />
            </div>
          </div>
          <SkeletonBlock className="mt-[14px] h-[42px] w-full rounded-[16px]" />
        </div>
      ))}
    </div>
  );
}

function PlanMissionContent() {
  return (
    <div className="pb-[108px]">
      <section className="pb-6 pt-5">
        <div className="mb-4 flex items-center justify-between px-4">
          <SkeletonBlock className="h-5 w-28 rounded" />
          <SkeletonBlock className="size-6 rounded-full" />
        </div>
        <RecommendationSkeleton />
      </section>
      <div className="h-[6px] bg-surface" />
      <section className="px-4 pt-5">
        <div className="flex items-end justify-between">
          <SkeletonBlock className="h-10 w-24 rounded" />
          <SkeletonBlock className="h-4 w-16 rounded" />
        </div>
        <SkeletonBlock className="mt-4 h-2 w-full rounded-full" />
      </section>
      <div className="mt-6 flex gap-[13px] overflow-hidden px-4 pb-2">
        {["filter-a", "filter-b", "filter-c", "filter-d"].map((key) => (
          <SkeletonBlock key={key} className="h-6 w-16 shrink-0 rounded-full" />
        ))}
      </div>
      <MissionListSkeleton />
    </div>
  );
}

export function PlanMissionSkeleton({
  contentOnly = false,
}: PageSkeletonProps) {
  if (contentOnly)
    return (
      <SkeletonStatus>
        <PlanMissionContent />
      </SkeletonStatus>
    );

  return (
    <SkeletonStatus>
      <div className="flex h-dvh min-h-0 flex-col bg-white">
        <div className="flex h-[52px] shrink-0 items-center gap-4 px-4 py-3">
          <SkeletonBlock className="size-6 rounded-full" />
          <SkeletonBlock className="h-5 w-1/2 rounded" />
        </div>
        <main className="min-h-0 flex-1 overflow-hidden">
          <PlanMissionContent />
        </main>
      </div>
    </SkeletonStatus>
  );
}
