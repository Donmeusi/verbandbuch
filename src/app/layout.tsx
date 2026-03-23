import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verbandbuch – Digitale Erste-Hilfe-Dokumentation | Hochschule Anhalt",
  description: "Digitales Verbandbuch zur Erfassung von Bagatellunfällen gemäß DGUV Vorschrift 1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Source+Sans+3:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
