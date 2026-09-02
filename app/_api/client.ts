import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const REQUEST_TIMEOUT_MS = 10000;

type HttpMethod = "GET" | "POST" | "PATCH";

const MSG_TIMEOUT = "요청 시간이 초과되었습니다.";
const MSG_NETWORK = "서버에 연결할 수 없습니다.";
const MSG_PARSE = "응답을 처리할 수 없습니다.";
const MSG_FAILED = "요청에 실패했습니다.";

export interface ApiResponse<T = null> {
  status: number;
  message: string;
  /** 실패 응답의 구체적 사유. 성공 응답에는 없을 수 있음. */
  detail?: string;
  data: T;
}

export class ApiError extends Error {
  status: number;
  message: string;
  /** 서버가 내려주는 구체적 실패 사유 (예: "startDate: 반드시 값이 있어야 합니다."). 없을 수 있음. */
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.status = status;
    this.message = message;
    this.detail = detail;
  }
}

/**
 * UI에서 catch한 에러를 사용자 메시지로 변환.
 * ApiError면 detail(구체 사유) > message > fallback 순으로 사용, 아니면 fallback.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.detail || err.message || fallback;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

/** timeout 초과 시 AbortController로 요청을 중단하는 fetch 래퍼. */
async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** 공통 fetch init 구성 (인증 헤더 + JSON 바디). */
function buildInit(method: HttpMethod, token: string | null, body?: object): RequestInit {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
}

/** fetchWithTimeout 호출을 감싸 네트워크/타임아웃 에러를 ApiError로 정규화. */
async function sendRequest(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetchWithTimeout(`${BASE_URL}${path}`, init);
  } catch (err) {
    throw new ApiError(isAbortError(err) ? 408 : 0, isAbortError(err) ? MSG_TIMEOUT : MSG_NETWORK);
  }
}

/** Response를 ApiResponse<T>로 파싱. 실패 응답이면 ApiError를 던진다. */
async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  let data: ApiResponse<T>;
  try {
    data = await res.json();
  } catch {
    throw new ApiError(res.status, MSG_PARSE);
  }
  if (!res.ok) throw new ApiError(data.status ?? res.status, data.message ?? MSG_FAILED, data.detail);
  return data;
}

async function request<T>(method: HttpMethod, path: string, body?: object): Promise<ApiResponse<T>> {
  const res = await sendRequest(path, buildInit(method, getAccessToken(), body));

  // 401이고 refresh token이 있으면 재발급 후 1회 재시도
  if (res.status === 401 && path !== "/api/auth/reissue") {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshed = await tryReissue(refreshToken);
      if (refreshed) {
        const retryRes = await sendRequest(path, buildInit(method, refreshed, body));
        return parseResponse<T>(retryRes);
      }
    }
  }

  return parseResponse<T>(res);
}

async function tryReissue(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/auth/reissue`, {
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
