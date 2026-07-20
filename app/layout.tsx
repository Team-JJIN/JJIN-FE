import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JJIN",
  description: "JJIN FE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
