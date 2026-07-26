/**
 * 토큰 저장/조회 유틸.
 * localStorage 기반. 추후 httpOnly 쿠키로 변경 시 이 파일만 수정.
 */

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
