import Link from "next/link";
import { Container } from "@/components/sections/_shared/Container";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Branded 404 for routes inside the (marketing) segment. Renders inside the
 * marketing layout (Header + Footer + Splash). Triggered when
 * `notFound()` is called (e.g. invalid service slug) or a URL under a
 * marketing route doesn't match.
 */
export default function MarketingNotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-ink relative">
        <Container className="flex min-h-[70vh] flex-col items-center justify-center pt-28 pb-16 text-center md:pt-32 md:pb-20 lg:pt-40 lg:pb-24">
          <p className="font-display text-brand-red text-[120px] leading-none font-black md:text-[180px] lg:text-[220px]">
            404
          </p>
          <h1 className="font-display text-surface mt-2 text-2xl leading-tight font-bold uppercase md:text-3xl lg:text-4xl">
            Page Not Found
          </h1>
          <p className="font-body text-surface/70 mx-auto mt-4 max-w-xl text-base md:text-lg">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className={cn(buttonVariants({ variant: "brand", size: "md" }))}>
              Back to Home
            </Link>
            <Link
              href="/services"
              className={cn(buttonVariants({ variant: "secondary", size: "md" }))}
            >
              Explore Services
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
