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
          src="/hero/services-hero-2.png"
          alt=""
          fill
          priority
          sizes="99vw"
          // Shifted left of center so the HSC logo on the wrapped helicopter
          // (left side of the source photo) isn't cropped off on narrower
          // viewports.
          className="object-cover object-[30%_center]"
        />
        <span className="bg-ink/40 md:bg-ink/40 absolute inset-0" />
      </div>

      <Container>
        {/*
         * Top-anchored layout: eyebrow + title sit at Figma's fixed top
         * coordinates (eyebrow `y=212` mobile / `y=294` desktop) instead of
         * being pushed against the bottom edge. The empty space below is
         * intentional — Figma frames `505:7643` / `345:6960`.
         */}
        <div className="flex min-h-[470px] flex-col pt-[212px] pb-12 md:min-h-[640px] md:pt-[250px] md:pb-20 lg:min-h-[705px] lg:pt-[294px] lg:pb-28">
          <Reveal>
            <SectionEyebrow variant="red" className="px-3 py-2">
              What We Do
            </SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-body text-surface mt-4 text-[32px] leading-[1.31] font-bold tracking-[0.02em] capitalize md:mt-6 md:text-5xl md:leading-[1.2] lg:text-[64px] lg:leading-[82px]">
              {/* Client copy change — was "Global Logistics Experts With
               * Unique Industry Access." */}
              Transport Solutions
              <br /> That Work.
            </h1>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
