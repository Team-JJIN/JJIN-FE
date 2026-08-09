import { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // /api/*, /auth/callback/* 는 intl 미들웨어 제외
    "/((?!_next|_vercel|api|auth/callback|.*\\..*).*)",
  ],
};
