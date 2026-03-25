import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PawAgent - AI 강아지 맞춤 용품 스코어링",
  description: "내 기준으로 제품을 평가하고 최저가를 찾아주는 AI 에이전트",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
