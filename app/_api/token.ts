const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

const isBrowser = typeof window !== "undefined";

export function saveTokens(accessToken: string, refreshToken: string) {
  if (!isBrowser) return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  if (!isBrowser) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
