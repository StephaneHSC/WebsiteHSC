import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { AppBadgeRow } from "@/components/ui/AppBadge";

/**
 * Home page Hero
 */
export function Hero() {
  return (
    <section className="bg-surface text-surface relative isolate w-full overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src="/home/hero-bg.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="from-ink/40 via-ink/55 to-ink/80 absolute inset-0 bg-gradient-to-br" />
      </div>

      <Container>
        <div className="flex min-h-[560px] items-center md:min-h-[640px] lg:min-h-[720px]">
          <div className="max-w-2xl space-y-6 py-20 md:space-y-8 md:py-28">
            <Reveal>
              <h1 className="font-display text-3xl leading-[1.1] font-medium tracking-tight md:text-5xl lg:text-6xl">
                Innovative Global Helicopter Freight Forwarder
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-body text-surface max-w-xl text-base leading-relaxed md:text-lg">
                Full-Service Air and Ocean Freight Forwarder. Providing End-To-End Visibility and
                Control Over Your Helicopter Shipments Through Bespoke Application.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <AppBadgeRow variant="light" />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
