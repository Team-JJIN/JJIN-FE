const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

const isBrowser = typeof window !== "undefined";

/** localStorage에 문자열 "undefined"/"null"이 저장돼 있던 과거 오염 값을 정상 토큰으로 취급하지 않는다. */
function isValidToken(value: string | null): value is string {
  return !!value && value !== "undefined" && value !== "null";
}

/** 유효한 값이면 저장, 아니면 오염 방지를 위해 기존 키를 제거한다. */
function setOrRemove(key: string, value: string | undefined | null) {
  if (isValidToken(value ?? null)) localStorage.setItem(key, value as string);
  else localStorage.removeItem(key);
}

export function saveTokens(accessToken: string, refreshToken: string) {
  if (!isBrowser) return;
  setOrRemove(ACCESS_KEY, accessToken);
  setOrRemove(REFRESH_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  if (!isBrowser) return null;
  const token = localStorage.getItem(ACCESS_KEY);
  return isValidToken(token) ? token : null;
}

export function getRefreshToken(): string | null {
  if (!isBrowser) return null;
  const token = localStorage.getItem(REFRESH_KEY);
  return isValidToken(token) ? token : null;
}

export function clearTokens() {
  if (!isBrowser) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
