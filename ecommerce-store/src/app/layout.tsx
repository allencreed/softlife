import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Love Soft Life",
  description: "Premium physical goods",
  manifest: "/manifest.json",
  openGraph: {
    title: "Love Soft Life",
    description: "Premium products for a comfortable life.",
    type: "website",
    siteName: "Love Soft Life",
  },
  twitter: {
    card: "summary_large_image",
    title: "Love Soft Life",
    description: "Premium products for a comfortable life.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Header />
        <main>{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
