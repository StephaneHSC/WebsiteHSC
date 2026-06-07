import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { WHY_CHOOSE_GLOBAL_REACH } from "@/lib/constants";

/**
 * /why-choose-us · "Global Reach" callout (Figma `466:6063` desktop /
 * `505:7491` top mobile). Centered eyebrow → uppercase H2 (mixed weights) →
 * lede → CTA. Faint dotted world-map graphic as a background flourish.
 *
 * Mobile and desktop diverge on the CTA: mobile is an OUTLINE (white bg, ink
 * text) pill while desktop is a FILLED RED pill — both render at all
 * viewports via display utilities.
 */
export function GlobalReachCallout() {
  const { eyebrow, h2, lede, ctaLabel, ctaHref } = WHY_CHOOSE_GLOBAL_REACH;

  return (
    <Section tone="light" spacing="standard" className="relative overflow-hidden">
      {/* World-map flourish — anchored lower than the visual middle so it
          sits behind the lede/CTA rather than the headline (matches Figma
          466:6063 where the dotted map's horizontal centerline aligns with
          the lede). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-[6%] justify-center"
      >
        <Image
          src="/home/world-map.svg"
          alt=""
          width={1098}
          height={596}
          priority
          className="h-auto w-full max-w-6xl [filter:brightness(0.92)_contrast(1.15)]"
        />
      </div>

      <Container className="relative">
        <div className="mx-auto flex flex-col items-center text-center">
          <Reveal>
            <SectionEyebrow variant="red" className="px-2 py-2">
              {eyebrow}
            </SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-ink mt-6 text-[24px] leading-[34px] uppercase md:text-[40px] md:leading-[52px] lg:mt-8 lg:text-[50px] lg:leading-[64px]">
              {/* Mobile forces the break between "AIRCRAFT" and "NEEDS"; desktop
                  joins inline so the line reads "WHEREVER YOUR AIRCRAFT NEEDS
                  TO GO,". */}
              <span className="block font-black">
                Wherever your aircraft
                <br className="lg:hidden" />
                <span className="hidden lg:inline"> </span>
                needs to go,
              </span>
              <span className="block font-bold">
                {h2.line2Pre}
                <span className="text-[#292d32]">{h2.line2Highlight}</span>
                {h2.line2Post}
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="font-body text-ink-soft mx-auto mt-6 max-w-[820px] text-[14px] leading-[26px] md:text-[15px] md:leading-[30px] lg:mt-8 lg:max-w-[830px] lg:text-[16px] lg:leading-[30px]">
              {lede}
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-6 lg:mt-6">
            {/* Mobile: outline pill (white bg, ink text). Figma `505:7498` —
                title-case label, 20×16 padding (NOT uppercase / 16×12 like the
                home/services CTAs). */}
            <Link
              href={ctaHref}
              className="border-ink text-ink font-body focus-visible:ring-brand-red hover:bg-ink hover:text-surface inline-flex items-center justify-center rounded-full border bg-white px-5 py-4 text-[12px] font-bold tracking-[0.06em] capitalize transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:hidden"
            >
              {ctaLabel}
            </Link>
            {/* Desktop: filled red pill. */}
            <Link
              href={ctaHref}
              className="bg-brand-red text-surface font-body focus-visible:ring-brand-red hover:bg-brand-red-dark hidden items-center justify-center rounded-full px-[30px] py-[20px] text-[14px] font-bold tracking-[0.06em] capitalize transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:inline-flex"
            >
              {ctaLabel}
            </Link>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
