import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { SHOWCASE_HERO } from "@/lib/constants";

/**
 * /showcase hero (Figma `344:4874` desktop / `505:6096` mobile).
 *
 * Full-bleed candid photo with a 0.36 black overlay (uniform desktop +
 * mobile, unlike M6 which used 0.40 desktop / 0.36 mobile). Red eyebrow,
 * 2-line desktop / 3-line mobile H1, no subhead — the Figma mobile
 * subhead carry-over from smart-tracking is intentionally dropped (see
 * DECISIONS.md 2026-05-10).
 */
export function ShowcaseHero() {
  return (
    <section className="text-surface relative isolate w-full overflow-hidden lg:aspect-[1600/700]">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src={SHOWCASE_HERO.photo}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        <span className="bg-ink/[0.36] absolute inset-0" />
      </div>

      <Container>
        <div className="flex min-h-[470px] flex-col justify-end pt-32 pb-10 md:min-h-[600px] md:pt-44 md:pb-14 lg:h-full lg:min-h-0 lg:pt-52 lg:pb-[63px]">
          <Reveal>
            <SectionEyebrow variant="red" className="px-3 py-2">
              {SHOWCASE_HERO.eyebrow}
            </SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-body text-surface mt-6 max-w-[748px] text-[32px] leading-[42px] font-bold tracking-[0.64px] capitalize md:mt-8 md:text-5xl md:leading-[1.2] md:tracking-normal lg:mt-10 lg:text-[64px] lg:leading-[82px]">
              {/* Mobile: 3 forced lines. Desktop wraps naturally to 2 lines. */}
              <span className="block lg:hidden">
                <span className="block">{SHOWCASE_HERO.h1Mobile[0]}</span>
                <span className="block">{SHOWCASE_HERO.h1Mobile[1]}</span>
                <span className="block">{SHOWCASE_HERO.h1Mobile[2]}</span>
              </span>
              <span className="hidden lg:block">
                <span className="block">{SHOWCASE_HERO.h1Desktop[0]}</span>
                <span className="block">{SHOWCASE_HERO.h1Desktop[1]}</span>
              </span>
            </h1>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
