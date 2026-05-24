import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, PT_Sans, Poppins } from "next/font/google";
import { SITE, SOCIAL_LINKS } from "@/lib/constants";
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

const SITE_DESCRIPTION =
  "Full-service air and ocean freight forwarder. End-to-end visibility and control over your helicopter shipments through bespoke logistics.";

// Resolve the public origin used for absolute URLs in metadata (OG image,
// canonical, etc.). Order: explicit NEXT_PUBLIC_SITE_URL → Vercel-provided
// VERCEL_URL (preview/prod deploys before DNS cutover) → hardcoded fallback.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : SITE.url);

export const metadata: Metadata = {
  title: {
    default: "Heli Skycargo — BESPOKE HELICOPTER SHIPPING",
    template: "%s | Heli Skycargo",
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Heli Skycargo",
    title: "Heli Skycargo — BESPOKE HELICOPTER SHIPPING",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Heli Skycargo — bespoke helicopter shipping worldwide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Heli Skycargo — BESPOKE HELICOPTER SHIPPING",
    description: SITE_DESCRIPTION,
    images: ["/og-default.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#E40C28",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Heli Skycargo",
  url: SITE.url,
  logo: `${SITE.url}/logo.svg`,
  description: SITE_DESCRIPTION,
  sameAs: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.youtube, SOCIAL_LINKS.x],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: SITE.email,
    availableLanguage: ["English"],
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="bg-surface text-ink font-body flex min-h-full flex-col">{children}</body>
    </html>
  );
}
