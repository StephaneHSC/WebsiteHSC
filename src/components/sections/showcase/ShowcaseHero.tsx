import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { SHOWCASE_HERO } from "@/lib/constants";
import { BackBreadcrumb } from "@/components/sections/_shared/BackBreadcrumb";

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
      <BackBreadcrumb href="/" label="Back to Home" />
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src={SHOWCASE_HERO.photo}
          alt=""
          fill
          priority
          sizes="100vw"
          // Mobile crops horizontally only (photo scales by height), so the
          // `[center_30%]` y-axis bias is a no-op there — only the desktop
          // `lg:object-center` matters and recenters the helicopter inside
          // the wider 1600/700 frame so it isn't cropped from the bottom.
          className="object-cover object-[center_30%] lg:object-[center_90%]"
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
              {/* Mobile: 3 forced lines per Figma 505:6096. Desktop wraps to 2. */}
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
          {/* Mobile-only subtitle per Figma 505:6106. */}
          <Reveal delay={0.2} className="lg:hidden">
            <p className="font-body text-surface/90 mt-4 max-w-[356px] text-[14px] leading-[16px] font-normal">
              {SHOWCASE_HERO.subtitleMobile}
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
