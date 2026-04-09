import type { Metadata } from "next";
import { Readex_Pro, Cairo } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";

const readexPro = Readex_Pro({
  variable: "--font-readex-pro",
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mirashop | ميراشوب — تسوق بذكاء",
  description:
    "ميراشوب — وجهتك الأولى للتسوق الإلكتروني بالمغرب. منتجات مختارة بعناية، توصيل سريع، والدفع عند الاستلام.",
  keywords: ["تسوق", "ميراشوب", "mirashop", "المغرب", "توصيل", "منتجات"],
  openGraph: {
    title: "Mirashop | ميراشوب",
    description: "تسوق أفضل المنتجات بأسعار لا تُقاوم مع الدفع عند الاستلام.",
    locale: "ar_MA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${readexPro.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-cairo bg-[#F5F6FA]">
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
