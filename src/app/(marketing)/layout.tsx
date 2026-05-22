import Script from "next/script";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * Layout for public marketing pages — wraps content with sticky Header and dark Footer.
 * Studio routes (under /studio) bypass this layout.
 *
 * Cloudflare Turnstile script is loaded once at this layout level so every
 * page hosting the quote form (standalone /quote + the 6 embedded shell
 * placements) gets `window.turnstile` available. Loaded with
 * `strategy="afterInteractive"` so it doesn't block hydration; idempotent.
 */
export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
      <Header />
      {children}
      <Footer />
    </>
  );
}
