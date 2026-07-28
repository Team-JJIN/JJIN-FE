/**
 * 토큰 저장/조회 유틸.
 * ⚠️ 클라이언트 전용 — 서버 컴포넌트에서 호출 금지.
 * localStorage 기반. 추후 httpOnly 쿠키로 변경 시 이 파일만 수정.
 */

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveTokens(accessToken: string, refreshToken: string) {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
