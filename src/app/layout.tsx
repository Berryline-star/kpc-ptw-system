import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KPC PTW Portal | Digital Permit-to-Work System",
  description:
    "Kenya Pipeline Company's Digital Permit-to-Work management and safety compliance system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        {/*
          Material Symbols is used as the icon font throughout every Stitch
          screen (e.g. <span class="material-symbols-outlined">). Loaded as
          a stylesheet since it's an icon font, not a text typeface — the
          no-page-custom-font rule is a Pages Router-era check and doesn't
          apply here.
        */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased bg-background text-on-background">
        {children}
      </body>
    </html>
  );
}
