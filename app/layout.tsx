import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "NovaDrop — Premium D2C Store",
  description:
    "Discover exclusive products with unbeatable quality. Fast shipping, easy returns, and a seamless shopping experience.",
  keywords: "ecommerce, D2C, premium products, online shopping",
  openGraph: {
    title: "NovaDrop — Premium D2C Store",
    description: "Exclusive products, direct to you.",
    type: "website",
  },
};

import { ABTestProvider } from "@/components/ABTestWrapper";
import { MetaPixel } from "@/components/MetaPixel";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans antialiased bg-[#0a0a0a] text-white`}>
        <SessionProvider>
          <ABTestProvider>
            <MetaPixel />
            <Navbar />
            <main>{children}</main>
            <Toaster />
          </ABTestProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
