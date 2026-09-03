/**
 * @module api/client
 * 모든 도메인 API 모듈(app/_api/<domain>.ts)이 쓰는 HTTP 클라이언트. 규칙: docs/API-RULE.md §3
 *
 * - 제공 함수: `apiGet<T>(path, query?)`, `apiPost<T>(path, body?)`, `apiPatch<T>(path, body?)`,
 *   `apiDelete<T>(path, body?)`. 응답은 서버 공통 봉투 `ApiResponse<T> { status, message, detail?, data }`.
 * - 쿼리: `query` 객체를 `buildQuery`가 문자열로 만든다. undefined/null/빈 문자열/빈 배열은 생략,
 *   배열은 반복 키(`a=1&a=2`, Spring List 바인딩). 호출부에서 문자열을 직접 결합하지 않는다.
 * - 바디: body가 있을 때만 `Content-Type: application/json`을 붙인다. 바디 없는 요청은 인자를 생략한다.
 * - 빈 바디: 응답을 `res.text()`로 받아 빈 바디를 null로 취급한다. 실패면 원래 status를 `ApiError`에 싣고,
 *   성공이면 `data: null`을 돌려준다.
 * - 401: 재발급 경로가 아닌 401은 refreshToken이 있으면 재발급 후 같은 요청을 1회 재시도한다.
 *   재발급 실패 또는 refreshToken 없음이면 `clearTokens()` 후 원래 401을 던진다.
 * - 실패: 네트워크 오류는 `ApiError(0)`, 10초 타임아웃은 `ApiError(408)`.
 *   UI 문구는 `getApiErrorMessage(err, fallback)`로 만든다(detail > message > fallback).
 */

import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "./token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const REQUEST_TIMEOUT_MS = 10000;
const REISSUE_PATH = "/api/auth/reissue";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

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
    this.name = "ApiError";
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

// ───────────── 쿼리 문자열 ─────────────

export type QueryValue =
  string | number | boolean | null | undefined | ReadonlyArray<string | number>;

/** apiGet의 두 번째 인자로 넘기는 쿼리 파라미터 객체 */
export type Query = Record<string, QueryValue>;

/**
 * undefined/null/빈 문자열/빈 배열은 생략, 배열은 반복 키(a=1&a=2, Spring List 바인딩), 값은 encodeURIComponent.
 */
export function buildQuery(params: Record<string, QueryValue>): string {
  const pairs: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      for (const item of value) {
        pairs.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`,
        );
      }
      continue;
    }

    pairs.push(
      `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );
  }

  return pairs.length ? `?${pairs.join("&")}` : "";
}

// ───────────── 요청 ─────────────

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

/** timeout 초과 시 AbortController로 요청을 중단하는 fetch 래퍼. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** 공통 fetch init 구성 (인증 헤더 + JSON 바디). Content-Type은 바디가 있을 때만 붙인다. */
function buildInit(
  method: HttpMethod,
  token: string | null,
  body?: object,
): RequestInit {
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
async function sendRequest(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetchWithTimeout(`${BASE_URL}${path}`, init);
  } catch (err) {
    throw new ApiError(
      isAbortError(err) ? 408 : 0,
      isAbortError(err) ? MSG_TIMEOUT : MSG_NETWORK,
    );
  }
}

/**
 * Response를 ApiResponse<T>로 파싱. 실패 응답이면 ApiError를 던진다.
 * JwtAuthenticationFilter의 401(만료)/403(토큰 없음)/400(잘못된 토큰)은 빈 바디로 온다.
 * 빈 바디는 null로 취급해 원래 status를 ApiError에 싣는다. 성공 응답이 빈 바디면 data: null.
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
    throw new ApiError(
      data?.status ?? res.status,
      data?.message ?? MSG_FAILED,
      data?.detail,
    );
  }
  return data ?? { status: res.status, message: "", data: null as T };
}

async function request<T>(
  method: HttpMethod,
  path: string,
  { body, query }: { body?: object; query?: Query } = {},
): Promise<ApiResponse<T>> {
  const pathWithQuery = `${path}${buildQuery(query ?? {})}`;
  const res = await sendRequest(
    pathWithQuery,
    buildInit(method, getAccessToken(), body),
  );

  // 401이고 refresh token이 있으면 재발급 후 1회 재시도
  if (res.status === 401 && path !== REISSUE_PATH) {
    const refreshToken = getRefreshToken();
    const reissued = refreshToken ? await tryReissue(refreshToken) : null;
    if (reissued) {
      const retryRes = await sendRequest(
        pathWithQuery,
        buildInit(method, reissued, body),
      );
      return parseResponse<T>(retryRes);
    }
    // 재발급 실패 또는 refreshToken 없음 — 만료된 accessToken을 남기지 않고 원래 401을 던진다
    clearTokens();
  }

  return parseResponse<T>(res);
}

/** refreshToken으로 accessToken 재발급. 실패하면 null (토큰 정리는 호출부 request가 한 번만 한다). */
async function tryReissue(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}${REISSUE_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await parseResponse<{ accessToken: string }>(res);
    saveTokens(data.data.accessToken, refreshToken);
    return data.data.accessToken;
  } catch {
    return null;
  }
}

export async function apiGet<T = null>(
  path: string,
  query?: Query,
): Promise<ApiResponse<T>> {
  return request<T>("GET", path, { query });
}

export async function apiPost<T = null>(
  path: string,
  body?: object,
): Promise<ApiResponse<T>> {
  return request<T>("POST", path, { body });
}

export async function apiPatch<T = null>(
  path: string,
  body?: object,
): Promise<ApiResponse<T>> {
  return request<T>("PATCH", path, { body });
}

export async function apiDelete<T = null>(
  path: string,
  body?: object,
): Promise<ApiResponse<T>> {
  return request<T>("DELETE", path, { body });
}
