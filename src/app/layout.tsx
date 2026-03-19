import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const siteUrl = "https://app.gh7.ai";
const siteTitle = "GH7.ai — Yapay Zeka Seni Tanıyor mu?";
const siteDescription =
  "Yapay zekaların sizi ne kadar tanıdığını öğrenin. ChatGPT, Claude, Gemini, Perplexity ve Google AI'da görünürlüğünüzü takip edin.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "yapay zeka görünürlük",
    "GEO",
    "yapay zeka optimizasyonu",
    "ChatGPT marka takibi",
    "Claude görünürlük",
    "Gemini sıralama",
    "Perplexity takip",
    "dijital varlık analizi",
  ],
  authors: [{ name: "GH7.ai" }],
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "GH7.ai",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GH7.ai — Yapay Zeka Görünürlük Takibi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
