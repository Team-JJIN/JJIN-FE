import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import QueryProvider from "@/app/_components/providers/QueryProvider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "JJIN",
  description: "JJIN — Living life for real",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JJIN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#171717",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ja" | "zh" | "ko")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="apple-touch-icon" href="/image/icon-192.png" />
      </head>
      <body className="bg-neutral-100">
        <div className="mx-auto w-full max-w-[430px] min-h-dvh max-h-dvh bg-white relative shadow-xl overflow-x-hidden overflow-y-auto scrollbar-hide">
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>{children}</QueryProvider>
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
