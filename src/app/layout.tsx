import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "FitTrack Pro - Your Personal Training Companion",
  description: "Premium fitness tracker with workout logging, progress analytics, and gamification",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-black text-white">
        <main className="flex-1 pb-24 lg:pb-8 lg:pl-20">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            {children}
          </div>
        </main>
        <Navigation />
      </body>
    </html>
  );
}
