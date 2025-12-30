import type { Metadata } from "next";
import { Nanum_Pen_Script, Caveat, Gaegu } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Korean handwritten font (손글씨)
const nanumPen = Nanum_Pen_Script({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nanum-pen',
});

// English handwritten font
const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-caveat',
});

// Alternative Korean handwritten font
const gaegu = Gaegu({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
  variable: '--font-gaegu',
});

export const metadata: Metadata = {
  title: "Catch AI Mind | 캐치 AI 마인드",
  description: "AI와 함께하는 그림 맞추기 게임",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="ko" className={`${nanumPen.variable} ${caveat.variable} ${gaegu.variable}`}>
      <body className="font-sketch antialiased bg-paper">
        {children}
        <Script defer src="https://umami.ericpark.me/script.js" data-website-id="1a519329-9aad-4302-8987-523670424ed4" />
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
