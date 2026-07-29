/**
 * API 클라이언트 설정.
 * 추후 백엔드 연결 시 BASE_URL만 변경하면 됨.
 */

import { getAccessToken } from "./token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface ApiResponse<T = null> {
  status: number;
  message: string;
  data: T;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiPost<T = null>(path: string, body: object): Promise<ApiResponse<T>> {
  const token = getAccessToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API 요청 실패: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export type { ApiResponse };
