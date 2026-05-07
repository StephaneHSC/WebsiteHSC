import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { WHY_CHOOSE_HERO } from "@/lib/constants";

/**
 * /why-choose-us hero (Figma `344:6116` desktop / `505:7165` mobile).
 *
 * Same shape as `ServiceDetailHero` minus the benefit chip strip — full-bleed
 * photo with a black overlay (36% mobile / 40% desktop), eyebrow + H1 anchored
 * near the bottom of the section.
 */
export function WhyChooseHero() {
  return (
    <section className="text-surface relative isolate w-full overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src={WHY_CHOOSE_HERO.photo}
          alt=""
          fill
          priority
          sizes="100vw"
          // Anchor the bottom of the photo to the bottom of the section so the
          // team stays fully visible inside the 16:7 letterbox at desktop —
          // matches Figma `344:6116` cropping (helicopter wrap top, team
          // mid-frame, ground at bottom).
          className="object-cover object-bottom"
        />
        <span className="bg-ink/[0.36] md:bg-ink/40 absolute inset-0" />
      </div>

      <Container>
        <div className="flex min-h-[470px] flex-col justify-end pt-32 pb-10 md:min-h-[600px] md:pt-44 md:pb-14 lg:min-h-[705px] lg:pt-52 lg:pb-[63px]">
          <Reveal>
            <SectionEyebrow variant="red" className="px-3 py-2">
              {WHY_CHOOSE_HERO.eyebrow}
            </SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-body text-surface mt-6 text-[32px] leading-[42px] font-bold capitalize md:mt-8 md:text-5xl md:leading-[1.2] lg:mt-12 lg:text-[64px] lg:leading-[82px]">
              {/* Mobile: 2-line break enforced. Desktop: joined inline. */}
              <span className="block lg:inline">{WHY_CHOOSE_HERO.h1Lines[0]}</span>
              <span className="hidden lg:inline"> </span>
              <span className="block lg:inline">{WHY_CHOOSE_HERO.h1Lines[1]}</span>
            </h1>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
