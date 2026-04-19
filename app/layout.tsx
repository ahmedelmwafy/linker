import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linker | Ultimate Cross-Device Clipboard",
  description: "Share text, links, and all media types between your PC, Laptop, and iPhone instantly with a professional glassmorphic experience.",
  keywords: ["clipboard sync", "file sharing", "cross-platform", "productivity", "iPhone sync", "PC to iPhone"],
  authors: [{ name: "Linker Team" }],
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
