"use client";

import { usePathname } from "next/navigation";
import {
  MissionHomeSkeleton,
  MissionFeedSkeleton,
} from "@/app/_components/loading/PageSkeletons";
import ScreenPreparation from "@/app/_components/loading/ScreenPreparation";

export default function Loading() {
  const pathname = usePathname();

  // The parent boundary can appear before a child route's fallback is ready.
  if (pathname.endsWith("/feed")) return <MissionFeedSkeleton />;
  if (pathname.endsWith("/search") || pathname.endsWith("/create")) {
    return <ScreenPreparation className="h-dvh" />;
  }
  return <MissionHomeSkeleton />;
}
