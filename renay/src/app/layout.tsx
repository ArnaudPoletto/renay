import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Renay — Subcontractor Compliance Made Simple",
  description:
    "Automate COI collection, document verification, and expiration tracking for general contractors. Stop losing time and money chasing subcontractor paperwork.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${plusJakarta.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}