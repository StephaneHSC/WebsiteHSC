import type { ReactNode } from "react";
import { Container } from "@/components/sections/_shared/Container";

type LegalPageProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/**
 * Shared layout for /privacy and /terms — dark hero band so the fixed
 * Header (which starts transparent + light-on-dark) remains visible, then a
 * narrow reading column for the body. Content typography styles come from
 * the page itself via the `.legal-prose` utility in globals.css.
 */
export function LegalPage({ title, subtitle, children }: LegalPageProps) {
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-ink relative">
        <Container className="pt-28 pb-10 md:pt-32 md:pb-14 lg:pt-40 lg:pb-16">
          <h1 className="font-display text-surface text-2xl leading-tight font-bold uppercase md:text-3xl lg:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="font-body text-surface/70 mt-3 text-sm md:text-base">{subtitle}</p>
          ) : null}
        </Container>
      </section>

      <section className="bg-surface">
        <Container className="py-12 md:py-16 lg:py-20">
          <div className="font-body text-ink-soft mx-auto max-w-3xl text-[15px] leading-[28px] md:text-base md:leading-[30px]">
            {children}
          </div>
        </Container>
      </section>
    </main>
  );
}
