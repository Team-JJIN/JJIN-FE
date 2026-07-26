/**
 * API 클라이언트 설정.
 * 추후 백엔드 연결 시 BASE_URL만 변경하면 됨.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface ApiResponse<T = null> {
  status: number;
  message: string;
  data: T;
}

export async function apiPost<T = null>(path: string, body: object): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  return res.json();
}

export type { ApiResponse };
