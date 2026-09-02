import { apiGet } from "./client";

/** 여행 지역 (지역 검색 API 응답 항목) */
export interface Region {
  id: number;
  displayName: string;
  lDongRegnCd: string;
  lDongSignguCd: string | null;
}

/**
 * 여행 지역 검색.
 * 키워드가 지역 표시명에 포함된 지역을 오름차순으로 최대 20개 반환한다.
 * 키워드가 비어 있거나 공백이면 서버가 빈 배열을 반환한다.
 */
export async function searchRegions(keyword: string): Promise<Region[]> {
  const query = encodeURIComponent(keyword.trim());
  const res = await apiGet<Region[]>(`/api/onboarding/regions?keyword=${query}`);
  return res.data ?? [];
}
