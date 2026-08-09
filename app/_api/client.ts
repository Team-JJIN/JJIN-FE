import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface ApiResponse<T = null> {
  status: number;
  message: string;
  data: T;
}

export class ApiError extends Error {
  status: number;
  message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

async function request<T>(method: "GET" | "POST" | "PATCH", path: string, body?: object): Promise<ApiResponse<T>> {
  const token = getAccessToken();

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(0, "서버에 연결할 수 없습니다.");
  }

  // 401이고 refresh token이 있으면 재발급 시도
  if (res.status === 401 && path !== "/api/auth/reissue") {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshed = await tryReissue(refreshToken);
      if (refreshed) {
        try {
          const retryRes = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshed}`,
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
          });
          const retryData: ApiResponse<T> = await retryRes.json();
          if (!retryRes.ok) throw new ApiError(retryData.status ?? retryRes.status, retryData.message ?? "요청에 실패했습니다.");
          return retryData;
        } catch (err) {
          if (err instanceof ApiError) throw err;
          throw new ApiError(0, "서버에 연결할 수 없습니다.");
        }
      }
    }
  }

  let data: ApiResponse<T>;
  try {
    data = await res.json();
  } catch {
    throw new ApiError(res.status, "응답을 처리할 수 없습니다.");
  }

  if (!res.ok) throw new ApiError(data.status ?? res.status, data.message ?? "요청에 실패했습니다.");
  return data;
}

async function tryReissue(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/reissue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data: ApiResponse<{ accessToken: string }> = await res.json();
    saveTokens(data.data.accessToken, refreshToken);
    return data.data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

export async function apiPost<T = null>(path: string, body: object): Promise<ApiResponse<T>> {
  return request<T>("POST", path, body);
}

export async function apiGet<T = null>(path: string): Promise<ApiResponse<T>> {
  return request<T>("GET", path);
}

export async function apiPatch<T = null>(path: string, body?: object): Promise<ApiResponse<T>> {
  return request<T>("PATCH", path, body);
}
