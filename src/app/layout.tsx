import type { Metadata } from "next";
import { Outfit, Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Modern Next.js Template",
  description: "A premium Next.js setup with Tailwind CSS and modern aesthetics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "font-sans", geist.variable)}>
      <body
        className={`${outfit.variable} ${inter.variable} antialiased min-h-full flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
