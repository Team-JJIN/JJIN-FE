const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export function buildGoogleOAuthUrl(locale: string): string {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
    redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? "",
    response_type: "code",
    scope: "openid email profile",
    state: locale,
    access_type: "offline",
    prompt: "select_account",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}
