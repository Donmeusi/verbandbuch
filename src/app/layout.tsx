import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verbandbuch – Digitale Erste-Hilfe-Dokumentation",
  description: "Digitales Verbandbuch zur Erfassung von Bagatellunfällen gemäß DGUV Vorschrift 1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
