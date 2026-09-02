import { apiPost, apiGet, apiPatch } from "./client";
import { clearTokens, saveTokens } from "./token";

export type Role = "ONBOARDING" | "MEMBER" | "ADMIN";

/** 인증 관련 API가 공통으로 반환하는 토큰 쌍 + 역할 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  role: Role;
}

export interface TermsItem {
  id: number;
  type: "SERVICE" | "MARKETING";
  title: string;
  required: boolean;
}

/** 구글 소셜 로그인 / 회원가입 */
export async function loginWithGoogle(code: string): Promise<AuthTokens> {
  const res = await apiPost<AuthTokens>("/api/auth/login/google", { code });
  return res.data;
}

/** 일반 이메일 로그인 */
export async function loginWithEmail(email: string, password: string): Promise<AuthTokens> {
  const res = await apiPost<AuthTokens>("/api/auth/login", { email, password });
  return res.data;
}

/** 회원가입 */
export async function signUp(
  email: string,
  password: string,
  termsAgreements: { type: string; agreed: boolean }[]
): Promise<AuthTokens> {
  const res = await apiPost<AuthTokens>("/api/auth/signup", { email, password, termsAgreements });
  return res.data;
}

/** 인증코드 발송 */
export async function sendVerificationCode(email: string): Promise<void> {
  await apiPost("/api/auth/email/code", { email });
}

/** 인증코드 검증 */
export async function verifyCode(email: string, code: string): Promise<void> {
  await apiPost("/api/auth/email/verify", { email, code });
}

/** 약관 목록 조회 */
export async function getTerms(): Promise<TermsItem[]> {
  const res = await apiGet<TermsItem[]>("/api/terms");
  return res.data;
}

/** role을 MEMBER로 변경 (온보딩 건너뛰기 시 호출) */
export async function updateRoleToMember(): Promise<AuthTokens> {
  const res = await apiPatch<AuthTokens>("/api/auth/role");
  return res.data;
}

/** 로그아웃 */
export async function logout(): Promise<void> {
  await apiPost("/api/auth/logout", {});
  clearTokens();
}

/** role에 따라 이동할 경로. ONBOARDING이면 온보딩, 그 외(MEMBER/ADMIN)는 mission. */
export function authDestination(role: Role, locale: string): string {
  return role === "ONBOARDING" ? `/${locale}/onboarding` : `/${locale}/mission`;
}

/**
 * 인증 성공 공통 처리: 토큰 저장 후 role에 맞는 경로로 라우팅.
 * @param navigate router.push 또는 router.replace를 넘긴다 (콜백 화면은 replace 권장).
 */
export function handleAuthSuccess(
  tokens: AuthTokens,
  locale: string,
  navigate: (path: string) => void
): void {
  saveTokens(tokens.accessToken, tokens.refreshToken);
  navigate(authDestination(tokens.role, locale));
}
