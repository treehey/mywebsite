import type { Metadata } from "next";
import { Syne, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "../components/SmoothScroll";
import LoadingScreen from "../components/LoadingScreen";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-grotesk",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "TREE HEY // SIGNAL & NOISE",
  description: "Developer × Photographer. Macau → Nanjing University.",
  icons: { icon: process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/favicon.png` : "/favicon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${grotesk.variable} ${mono.variable} bg-[#07070F] text-[#E2E2EC] antialiased selection:bg-[#00F5FF]/20 selection:text-[#00F5FF] overflow-x-clip`}
        style={{ fontFamily: "var(--font-grotesk), system-ui, sans-serif" }}
      >
        <LoadingScreen />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
