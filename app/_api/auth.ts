/**
 * Auth API 함수들. 현재 mock 데이터 반환.
 * 추후 apiPost로 교체하면 백엔드 연결 완료.
 */

// import { apiPost } from "./client";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  role: "ONBOARDING" | "MEMBER";
}

// 일반 로그인
export async function loginWithEmail(email: string, password: string): Promise<AuthTokens> {
  // 추후: return (await apiPost<AuthTokens>("/api/auth/login", { email, password })).data;
  await delay(500);
  return mockTokens("ONBOARDING");
}

// 구글 소셜 로그인
export async function loginWithGoogle(code: string): Promise<AuthTokens> {
  // 추후: return (await apiPost<AuthTokens>("/api/auth/google", { code })).data;
  await delay(500);
  return mockTokens("ONBOARDING");
}

// 회원가입
export async function signUp(
  email: string,
  password: string,
  termsAgreements: { type: "SERVICE" | "MARKETING"; agreed: boolean }[]
): Promise<AuthTokens> {
  // 추후: return (await apiPost<AuthTokens>("/api/auth/signup", { email, password, termsAgreements })).data;
  await delay(500);
  return mockTokens("ONBOARDING");
}

// 인증 코드 발송
export async function sendVerificationCode(email: string): Promise<void> {
  // 추후: await apiPost("/api/auth/email/send", { email });
  await delay(300);
}

// 인증 코드 검증
export async function verifyCode(email: string, code: string): Promise<boolean> {
  // 추후: const res = await apiPost("/api/auth/email/verify", { email, code }); return res.status === 200;
  await delay(500);
  return code.length === 6; // mock: 6자리면 성공
}

// 토큰 재발급
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  // 추후: return (await apiPost<{ accessToken: string }>("/api/auth/refresh", { refreshToken })).data.accessToken;
  await delay(200);
  return "mock-new-access-token";
}

// --- 유틸 ---
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function mockTokens(role: "ONBOARDING" | "MEMBER"): AuthTokens {
  return {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    role,
  };
}
