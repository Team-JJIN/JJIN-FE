import { apiPost, apiGet, apiPatch } from "./client";
import { clearTokens } from "./token";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  role: "ONBOARDING" | "MEMBER";
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
