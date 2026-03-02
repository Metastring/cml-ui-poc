import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@metastringfoundation/map-list/styles.css"

import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import ThemeWrapper from "@/components/layout/ThemeWrapper";
import TanstackQueryProvider from "@/components/providers/TanstackQueryProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CML — Cataloging and Mapping Life of India",
  description:
    "Explore geographically referenced ecological, health and climate data. Search, map, and contribute to biodiversity data for India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <TanstackQueryProvider>
          <ThemeWrapper>
            <Sidebar />
            <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
          </ThemeWrapper>
        </TanstackQueryProvider>
           <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
