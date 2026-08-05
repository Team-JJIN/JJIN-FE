/**
 * Auth API 함수들.
 * - loginWithGoogle: 실제 백엔드 연결 완료 (/api/auth/login/google)
 * - 나머지: 백엔드 미완성으로 mock 유지. apiPost 주석 교체 시 즉시 연결 가능.
 */

import { apiPost } from "./client";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  role: "ONBOARDING" | "MEMBER";
}

// ─── 실제 연결된 API ───────────────────────────────────────────

/** 구글 소셜 로그인 / 회원가입 (백엔드 연결 완료) */
export async function loginWithGoogle(code: string): Promise<AuthTokens> {
  const res = await apiPost<AuthTokens>("/api/auth/login/google", { code });
  return res.data;
}

// ─── 미연결 (mock) ─────────────────────────────────────────────

/** 일반 이메일 로그인 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<AuthTokens> {
  // TODO: return (await apiPost<AuthTokens>("/api/auth/login", { email, password })).data;
  await delay(500);
  return mockTokens("ONBOARDING");
}

/** 회원가입 */
export async function signUp(
  email: string,
  password: string,
  termsAgreements: { type: "SERVICE" | "MARKETING"; agreed: boolean }[]
): Promise<AuthTokens> {
  // TODO: return (await apiPost<AuthTokens>("/api/auth/signup", { email, password, termsAgreements })).data;
  await delay(500);
  return mockTokens("ONBOARDING");
}

/** 인증 코드 발송 */
export async function sendVerificationCode(email: string): Promise<void> {
  // TODO: await apiPost("/api/auth/email/send", { email });
  await delay(300);
}

/** 인증 코드 검증 */
export async function verifyCode(email: string, code: string): Promise<boolean> {
  // TODO: const res = await apiPost("/api/auth/email/verify", { email, code }); return res.status === 200;
  await delay(500);
  return code.length === 6;
}

/** 액세스 토큰 재발급 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  // TODO: return (await apiPost<{ accessToken: string }>("/api/auth/refresh", { refreshToken })).data.accessToken;
  await delay(200);
  return "mock-new-access-token";
}

// ─── 내부 유틸 (mock 전용) ─────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function mockTokens(role: "ONBOARDING" | "MEMBER"): AuthTokens {
  return {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    role,
  };
}
