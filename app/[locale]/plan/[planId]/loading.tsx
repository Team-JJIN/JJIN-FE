"use client";

import { usePathname } from "next/navigation";
import {
  ScheduleSkeleton,
  PlanMissionSkeleton,
} from "@/app/_components/loading/PageSkeletons";
import ScreenPreparation from "@/app/_components/loading/ScreenPreparation";

export default function Loading() {
  const pathname = usePathname();

  if (pathname.endsWith("/mission")) return <PlanMissionSkeleton />;
  if (pathname.endsWith("/search") || pathname.endsWith("/course")) {
    return <ScreenPreparation className="h-dvh" />;
  }
  return <ScheduleSkeleton />;
}
