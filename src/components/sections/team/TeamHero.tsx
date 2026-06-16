import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { TEAM_HERO } from "@/lib/constants";
import { BackBreadcrumb } from "@/components/sections/_shared/BackBreadcrumb";

/**
 * /team hero (Figma `344:4891` desktop / `505:6782` mobile).
 *
 * Full-bleed candid photo with a black overlay (36% mobile / 40% desktop),
 * red eyebrow, and a 2-line desktop / 3-line mobile H1.
 */
export function TeamHero() {
  return (
    <section className="text-surface relative isolate w-full overflow-hidden lg:aspect-[16/7]">
      <BackBreadcrumb href="/" label="Back to Home" />
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {/* Mobile uses the portrait crop so the team fills the 430×500 frame
            (Figma `505:6782`); tablet+ uses the wide 16:7 candid. `sizes` is
            scoped per breakpoint (0 px on the viewport where the image is
            `display:none`) so Next doesn't pre-fetch the wrong variant. */}
        <Image
          src={TEAM_HERO.photoMobile}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 0px, 100vw"
          className="object-cover object-center lg:hidden"
        />
        <Image
          src={TEAM_HERO.photo}
          alt=""
          fill
          priority
          sizes="(max-width: 1023px) 0px, 100vw"
          className="hidden object-cover object-[center_65%] lg:block"
        />
        <span className="bg-ink/[0.36] md:bg-ink/40 absolute inset-0" />
      </div>

      <Container>
        <div className="flex min-h-[500px] flex-col justify-end pt-32 pb-10 md:min-h-[600px] md:pt-44 md:pb-14 lg:h-full lg:min-h-0 lg:pt-52 lg:pb-[63px]">
          <Reveal>
            <SectionEyebrow variant="red" className="px-3 py-2">
              {TEAM_HERO.eyebrow}
            </SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-body text-surface mt-6 max-w-[633px] text-[32px] leading-[42px] font-bold capitalize md:mt-8 md:text-5xl md:leading-[1.2] lg:mt-10 lg:text-[64px] lg:leading-[82px]">
              {/* Mobile: 3-line break enforced. Desktop wraps naturally. */}
              <span className="block lg:inline">{TEAM_HERO.h1Lines[0]} </span>
              <span className="block lg:inline">{TEAM_HERO.h1Lines[1]} </span>
              <span className="block lg:inline">{TEAM_HERO.h1Lines[2]}</span>
            </h1>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
