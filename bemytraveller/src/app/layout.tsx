import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import FloatingWhatsApp from "@/components/common/FloatingWhatsApp";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Be My Traveller",
    default: "Be My Traveller — Curated Experiential Travel & Custom Trips",
  },
  description:
    "Design and book customized travel packages, immersive itineraries, premium stays, and unique adventures across extraordinary destinations.",
  authors: [{ name: "RR Digital Solutions (RRDS)" }],
  generator: "RRDS Travel Architecture Engine",
  other: {
    watermark: "RRDS",
    "developed-by": "RR Digital Solutions",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-watermark="RRDS"
      data-engine="RRDS-Travel-Engine"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900" data-author="RRDS">
        <SiteSettingsProvider>
          {children}
          <FloatingWhatsApp />
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
