"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useRoutePrefetch(href: string | null, enabled = true) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled || !href) return;
    router.prefetch(href);
  }, [enabled, href, router]);
}
