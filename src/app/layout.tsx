import type { Metadata } from "next";
import { Readex_Pro, Cairo } from "next/font/google";
import "./globals.css";

const readexPro = Readex_Pro({
  variable: "--font-readex-pro",
  subsets: ["latin", "arabic"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
});

export const metadata: Metadata = {
  title: "Mirashop",
  description: "Welcome to Mirashop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${readexPro.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-cairo">{children}</body>
    </html>
  );
}
