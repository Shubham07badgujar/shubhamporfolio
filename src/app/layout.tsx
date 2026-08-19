import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Cursor } from "@/components/ui/Cursor";
import { profile } from "@/data/profile";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: `${profile.fullName} — An Interactive Engineering Experience`,
    template: `%s · ${profile.fullName}`,
  },
  description: profile.tagline,
  keywords: [
    "Shubham Badgujar",
    "Computer Engineer",
    "Software Developer",
    "AI/ML",
    "Data Science",
    "Portfolio",
  ],
  openGraph: {
    title: `${profile.fullName} — Interactive Portfolio`,
    description: profile.tagline,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MotionProvider>
          <SmoothScroll>
            {children}
            <Cursor />
          </SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
