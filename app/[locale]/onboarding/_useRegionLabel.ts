"use client";

import { useTranslations } from "next-intl";

/**
 * 지역 표시명 번역 훅.
 * 서버가 주는 displayName(한국어)을 i18n의 `regions.<한국어>` 키로 번역한다.
 * 번역 키가 없는 지역은 원문(한국어) 그대로 노출한다.
 */
export function useRegionLabel() {
  const t = useTranslations("onboarding");
  return (displayName: string) =>
    t.has(`regions.${displayName}`) ? t(`regions.${displayName}`) : displayName;
}
