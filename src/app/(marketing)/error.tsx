"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/sections/_shared/Container";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Error boundary for marketing routes. Renders when an unhandled error is
 * thrown during page render (Sanity unreachable, build artifact missing,
 * unexpected runtime exception). Must be a Client Component per Next.js
 * file-convention requirements.
 */
export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console so the dev / browser DevTools can capture it. Wire to
    // Sentry / Vercel error reporter later if analytics are added.
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-ink relative">
        <Container className="flex min-h-[70vh] flex-col items-center justify-center pt-28 pb-16 text-center md:pt-32 md:pb-20 lg:pt-40 lg:pb-24">
          <p className="font-display text-brand-red text-[80px] leading-none font-black md:text-[120px]">
            !
          </p>
          <h1 className="font-display text-surface mt-2 text-2xl leading-tight font-bold uppercase md:text-3xl lg:text-4xl">
            Something went wrong
          </h1>
          <p className="font-body text-surface/70 mx-auto mt-4 max-w-xl text-base md:text-lg">
            We hit an unexpected error loading this page. Please try again, or head back to the home
            page.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className={cn(buttonVariants({ variant: "brand", size: "md" }))}
            >
              Try Again
            </button>
            <Link href="/" className={cn(buttonVariants({ variant: "secondary", size: "md" }))}>
              Back to Home
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
