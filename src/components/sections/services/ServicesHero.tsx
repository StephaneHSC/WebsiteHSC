import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";

/**
 * Services listing hero — full-bleed photo of HSC's Global Customer Support
 * Center room with a 40% black overlay and PT Sans Bold display copy on top.
 * Mirrors Figma frame `345:6960` (desktop) + `505:7643` (mobile).
 */
export function ServicesHero() {
  return (
    <section className="text-surface relative isolate w-full overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src="/hero/services-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <span className="bg-ink/40 md:bg-ink/40 absolute inset-0" />
      </div>

      <Container>
        <div className="flex min-h-[470px] flex-col justify-end pt-32 pb-12 md:min-h-[640px] md:pt-44 md:pb-20 lg:min-h-[705px] lg:pt-56 lg:pb-28">
          <Reveal>
            <SectionEyebrow variant="red" className="px-3 py-2">
              What We Do
            </SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-body text-surface mt-6 text-[32px] leading-[1.31] font-bold tracking-[0.02em] capitalize md:mt-8 md:text-5xl md:leading-[1.2] lg:text-[64px] lg:leading-[82px]">
              <span className="block">Global logistics experts</span>
              <span className="block">with unique industry access.</span>
            </h1>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
