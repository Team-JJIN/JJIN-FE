/**
 * @hook useLocale
 * URL params에서 locale 추출. 기본값 "en"
 */
"use client";

import { useParams } from "next/navigation";

export function useLocale(): string {
  const params = useParams();
  return (params?.locale as string) ?? "en";
}
