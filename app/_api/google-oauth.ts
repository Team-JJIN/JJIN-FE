/**
 * Google OAuth 2.0 유틸.
 * Client ID와 Redirect URI는 환경변수로 관리.
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export function buildGoogleOAuthUrl(locale: string): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? "";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    // state에 locale을 실어서 callback 후 올바른 locale로 복귀
    state: locale,
    access_type: "offline",
    prompt: "select_account",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}
