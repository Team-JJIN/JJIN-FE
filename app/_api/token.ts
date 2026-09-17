/**
 * @module api/token
 * 토큰 저장 전략 (프론트 차원 보안 강화):
 * - accessToken: 메모리(모듈 변수) 보관. 새로고침 시 사라지므로 restoreSession()으로 복구한다.
 * - refreshToken: sessionStorage 보관. localStorage보다 노출 시간이 짧다(탭 종료 시 삭제).
 *
 * NOTE: 완전한 보안(refresh를 httpOnly Secure 쿠키로 저장)은 서버의 Set-Cookie 지원이 필요해
 *   프론트 단독으로는 불가능하다. 백엔드가 쿠키 기반 재발급을 지원하면 그때 전환한다.
 */

const REFRESH_KEY = "refreshToken";
const isBrowser = typeof window !== "undefined";

// accessToken은 메모리에만 보관 (localStorage/sessionStorage에 저장하지 않음)
let accessTokenInMemory: string | null = null;

/** 문자열 "undefined"/"null"이 저장돼 있던 과거 오염 값을 정상 토큰으로 취급하지 않는다. */
function isValidToken(value: string | null | undefined): value is string {
  return !!value && value !== "undefined" && value !== "null";
}

export function saveTokens(accessToken: string, refreshToken: string) {
  // accessToken: 메모리
  if (isValidToken(accessToken)) accessTokenInMemory = accessToken;
  // refreshToken: sessionStorage (유효한 값일 때만 갱신, 아니면 기존 값 유지)
  if (isBrowser && isValidToken(refreshToken)) {
    sessionStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

/** accessToken만 갱신 (재발급 응답 처리용). */
export function setAccessToken(accessToken: string) {
  if (isValidToken(accessToken)) accessTokenInMemory = accessToken;
}

export function getAccessToken(): string | null {
  return isValidToken(accessTokenInMemory) ? accessTokenInMemory : null;
}

export function getRefreshToken(): string | null {
  if (!isBrowser) return null;
  const token = sessionStorage.getItem(REFRESH_KEY);
  return isValidToken(token) ? token : null;
}

export function clearTokens() {
  accessTokenInMemory = null;
  if (isBrowser) sessionStorage.removeItem(REFRESH_KEY);
}
