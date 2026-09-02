/**
 * @module api/client-ext
 * client.ts(feature/login-api 기준 — 병합 충돌을 막기 위해 수정하지 않는다)에 없는 HTTP 메서드 확장.
 * 병합 뒤 client.ts로 통합하고 이 파일은 삭제한다 — docs/TODO-api-client.md
 *
 * 한계(의도된 임시 상태): client.ts의 request()가 export되지 않아 401 재발급·재시도를 공유하지 못한다.
 * 유일한 호출부(removeMissionFromPlans)는 대개 직전 GET(useMissionPlanLikes)이나 같은 저장의 앞선
 * POST(addMissionToPlans)가 토큰을 갱신해 둔 뒤 실행된다. 다만 패널을 오래 열어 두고 "해제만" 저장하는
 * 경우에는 재발급 없이 401로 실패한다 — 좁지만 실재하는 구멍이며 병합 후 통합(DELETE를 request()에 편입)으로 닫는다.
 */

import { ApiError, type ApiResponse } from "./client";
import { getAccessToken } from "./token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function apiDelete<T = null>(
  path: string,
  body?: object,
): Promise<ApiResponse<T>> {
  const token = getAccessToken();

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(0, "서버에 연결할 수 없습니다.");
  }

  // JwtAuthenticationFilter의 401/403/400은 빈 바디 — JSON.parse 대신 null로 취급
  const text = await res.text();
  let data: ApiResponse<T> | null = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(res.status, "응답을 처리할 수 없습니다.");
    }
  }

  if (!res.ok) {
    throw new ApiError(
      data?.status ?? res.status,
      data?.message ?? "요청에 실패했습니다.",
    );
  }
  return data ?? { status: res.status, message: "", data: null as T };
}
