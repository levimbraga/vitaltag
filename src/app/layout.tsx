import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VitalTag",
  description: "Ficha clínica de emergência acessível por QR Code",
};

export const viewport: Viewport = {
  themeColor: "#393683",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // A variável da fonte fica no <html>, onde o Tailwind aplica font-sans.
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
