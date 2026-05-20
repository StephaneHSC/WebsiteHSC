import type { Metadata } from "next";
import { Inter, Inter_Tight, PT_Sans, Poppins } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["600"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "900"],
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
    <html
      lang="en"
      className={`${interTight.variable} ${ptSans.variable} ${inter.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Pre-hydration check: if the splash has been seen this session,
            add a class to <html> so CSS hides the overlay before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('hsc-splash-seen'))document.documentElement.classList.add('hsc-splash-seen')}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-surface text-ink font-body flex min-h-full flex-col">{children}</body>
    </html>
  );
}
