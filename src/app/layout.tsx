import type { Metadata } from "next";
import { Dancing_Script, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeepStudy AI",
  description: "AI-powered research automation for smarter reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${dancingScript.variable} ${playfairDisplay.variable} font-inter antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
