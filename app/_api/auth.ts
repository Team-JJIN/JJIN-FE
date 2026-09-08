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

/**
 * 인증 성공 후 이동할 경로.
 *
 * NOTE: 여행 기본정보/취향 입력(온보딩 S1~S4)은 첫 로그인이 아니라 '일정 생성' 시점으로 이동할 예정이라,
 *   현재는 role과 무관하게 항상 mission(홈)으로 보낸다. 온보딩 화면(/onboarding)과 관련 코드는
 *   재사용을 위해 그대로 보존하며, 여기서 진입만 끊는다. (일정 생성 플로우 확정 시 라우팅 재정의)
 */
export function authDestination(_role: Role, locale: string): string {
  return `/${locale}/mission`;
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
