import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { MainNav } from "@/components/main-nav";

export const metadata: Metadata = {
  title: "SimpleMMO — Idle Play2Earn MMO",
  description:
    "Train skills, fight monsters and players, gather, craft and trade on the Black Market. Idle in the background, claim offline rewards.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SimpleMMO",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh antialiased">
        <Providers>
          <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col md:flex-row">
            <MainNav />
            <main className="flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-12 md:pt-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
