import type { Metadata } from "next";
import { Inter_Tight, PT_Sans } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Heli Skycargo — BESPOKE HELICOPTER SHIPPING",
    template: "%s | Heli Skycargo",
  },
  description:
    "Full-service air and ocean freight forwarder. End-to-end visibility and control over your helicopter shipments through bespoke logistics.",
  metadataBase: new URL("https://heliskycargo.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${interTight.variable} ${ptSans.variable} h-full antialiased`}>
      <body className="bg-surface text-ink font-body flex min-h-full flex-col">{children}</body>
    </html>
  );
}
