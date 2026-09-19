/**
 * @module api/client
 * 모든 도메인 API 모듈(app/_api/<domain>.ts)이 쓰는 HTTP 클라이언트. 규칙: docs/API-RULE.md §3
 *
 * 제공 함수
 *   apiGet<T>(path, query?)  apiPost<T>(path, body?, opts?)
 *   apiPatch<T>(path, body?) apiDelete<T>(path, body?)
 *   응답 타입: ApiResponse<T> { status, message, detail?, data }
 *
 * 쿼리
 *   query 객체를 buildQuery가 문자열로 변환. undefined/null/빈 값/빈 배열은 생략,
 *   배열은 반복 키(a=1&a=2, Spring List 바인딩).
 *
 * 바디
 *   body가 있을 때만 Content-Type: application/json을 붙인다.
 *
 * 빈 응답 바디
 *   res.text()로 받아 빈 바디를 null로 취급한다.
 *   실패면 원래 status를 ApiError에 싣고, 성공이면 data: null을 반환한다.
 *
 * 401 처리
 *   재발급 경로(/api/auth/reissue)가 아닌 401은 refreshToken이 있으면
 *   재발급 후 같은 요청을 1회 재시도한다.
 *   재발급 실패 또는 refreshToken 없으면 clearTokens() 후 auth:expired 이벤트를 dispatch하고
 *   ApiError(401)을 throw해 호출부까지 전달한다.
 *   이벤트는 AuthGuard(useAuthExpired 훅)가 수신해 /{locale}/auth로 replace한다.
 *   연속 dispatch를 막기 위해 authExpiredDispatched 플래그를 사용하고,
 *   로그인 성공(saveTokens) 시 플래그를 초기화한다.
 *
 * 실패
 *   네트워크 오류 → ApiError(0), 타임아웃 → ApiError(408).
 *   UI 문구는 getApiErrorMessage(err, fallback)으로 만든다(detail > message > fallback).
 */

import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from "./token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const REQUEST_TIMEOUT_MS = 10_000;
const REISSUE_PATH = "/api/auth/reissue";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

const MSG_TIMEOUT = "요청 시간이 초과되었습니다.";
const MSG_NETWORK = "서버에 연결할 수 없습니다.";
const MSG_PARSE = "응답을 처리할 수 없습니다.";
const MSG_FAILED = "요청에 실패했습니다.";

// ───────────── 인증 만료 이벤트 ─────────────

/**
 * clearTokens() 이후 auth:expired를 window에 dispatch해 AuthGuard가 /auth로 리다이렉트하게 한다.
 * 동일 세션에서 여러 요청이 동시에 401을 받으면 중복으로 dispatch될 수 있으므로
 * 플래그로 1회만 전파한다. 다음 로그인 성공 시 resetAuthExpiredFlag()로 초기화한다.
 */
let authExpiredDispatched = false;

export function resetAuthExpiredFlag() {
  authExpiredDispatched = false;
}

function dispatchAuthExpired() {
  if (authExpiredDispatched) return;
  authExpiredDispatched = true;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:expired"));
  }
}

// ───────────── 공개 타입 ─────────────

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
  /** 서버가 내려주는 구체적 실패 사유. 없을 수 있음. */
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.message = message;
    this.detail = detail;
  }
}

/**
 * UI에서 catch한 에러를 사용자 메시지로 변환.
 * ApiError면 detail > message > fallback 순, 아니면 fallback.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.detail || err.message || fallback;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

// ───────────── 쿼리 문자열 ─────────────

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ReadonlyArray<string | number>;

export type Query = Record<string, QueryValue>;

/**
 * undefined/null/빈 문자열/빈 배열은 생략, 배열은 반복 키(a=1&a=2), 값은 encodeURIComponent.
 */
export function buildQuery(params: Record<string, QueryValue>): string {
  const pairs: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      for (const item of value) {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
      }
      continue;
    }

    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }

  return pairs.length ? `?${pairs.join("&")}` : "";
}

// ───────────── 요청 내부 구현 ─────────────

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

/** timeout 초과 시 AbortController로 요청을 중단하는 fetch 래퍼. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** 공통 fetch init 구성 (인증 헤더 + JSON 바디). Content-Type은 바디가 있을 때만 붙인다. */
function buildInit(method: HttpMethod, token: string | null, body?: object): RequestInit {
  return {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
}

/** fetchWithTimeout 호출을 감싸 네트워크/타임아웃 에러를 ApiError로 정규화. */
async function sendRequest(path: string, init: RequestInit, timeoutMs?: number): Promise<Response> {
  try {
    return await fetchWithTimeout(`${BASE_URL}${path}`, init, timeoutMs);
  } catch (err) {
    throw new ApiError(
      isAbortError(err) ? 408 : 0,
      isAbortError(err) ? MSG_TIMEOUT : MSG_NETWORK,
    );
  }
}

/**
 * Response를 ApiResponse<T>로 파싱. 실패 응답이면 ApiError를 던진다.
 * JwtAuthenticationFilter의 401/403/400은 빈 바디로 온다.
 * 빈 바디는 null로 취급해 원래 status를 ApiError에 싣는다.
 */
async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text();
  let data: ApiResponse<T> | null = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(res.status, MSG_PARSE);
    }
  }
  if (!res.ok) {
    throw new ApiError(data?.status ?? res.status, data?.message ?? MSG_FAILED, data?.detail);
  }
  return data ?? { status: res.status, message: "", data: null as T };
}

async function request<T>(
  method: HttpMethod,
  path: string,
  { body, query, timeoutMs }: { body?: object; query?: Query; timeoutMs?: number } = {},
): Promise<ApiResponse<T>> {
  const pathWithQuery = `${path}${buildQuery(query ?? {})}`;
  const res = await sendRequest(pathWithQuery, buildInit(method, getAccessToken(), body), timeoutMs);

  // 401이고 재발급 경로가 아니면 refreshToken으로 재발급 후 1회 재시도
  if (res.status === 401 && path !== REISSUE_PATH) {
    const refreshToken = getRefreshToken();
    const reissued = refreshToken ? await tryReissue(refreshToken) : null;

    if (reissued) {
      const retryRes = await sendRequest(
        pathWithQuery,
        buildInit(method, reissued, body),
        timeoutMs,
      );
      return parseResponse<T>(retryRes);
    }

    // 재발급 실패 또는 refreshToken 없음 — 토큰 정리 후 auth 이동 이벤트 전파
    clearTokens();
    dispatchAuthExpired();
    throw new ApiError(401, MSG_FAILED);
  }

  return parseResponse<T>(res);
}

/** refreshToken으로 accessToken 재발급. 실패하면 null. */
async function tryReissue(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}${REISSUE_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await parseResponse<{ accessToken: string }>(res);
    setAccessToken(data.data.accessToken);
    return data.data.accessToken;
  } catch {
    return null;
  }
}

// ───────────── 공개 함수 ─────────────

/**
 * 앱 시작/새로고침 시 세션 복구.
 * accessToken은 메모리 보관이라 새로고침하면 사라진다. refreshToken(sessionStorage)이 있으면
 * 재발급해 accessToken을 복구한다. 성공 시 true, 실패/토큰없음 시 false.
 */
export async function restoreSession(): Promise<boolean> {
  if (getAccessToken()) return true;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  const reissued = await tryReissue(refreshToken);
  if (!reissued) {
    clearTokens();
    return false;
  }
  return true;
}

export async function apiGet<T = null>(path: string, query?: Query): Promise<ApiResponse<T>> {
  return request<T>("GET", path, { query });
}

export async function apiPost<T = null>(
  path: string,
  body?: object,
  options?: { timeoutMs?: number },
): Promise<ApiResponse<T>> {
  return request<T>("POST", path, { body, timeoutMs: options?.timeoutMs });
}

export async function apiPatch<T = null>(path: string, body?: object): Promise<ApiResponse<T>> {
  return request<T>("PATCH", path, { body });
}

export async function apiDelete<T = null>(path: string, body?: object): Promise<ApiResponse<T>> {
  return request<T>("DELETE", path, { body });
}
