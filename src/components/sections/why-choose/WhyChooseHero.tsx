import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { WHY_CHOOSE_HERO } from "@/lib/constants";
import { BackBreadcrumb } from "@/components/sections/_shared/BackBreadcrumb";

/**
 * /why-choose-us hero (Figma `344:6116` desktop / `505:7165` mobile).
 *
 * The background image is positioned with Figma's exact crop percentages
 * — at design-spec breakpoints (mobile 430×470, desktop 1600×705) the
 * cropped window matches Figma to the pixel. Eyebrow + H1 are vertically
 * anchored via bottom-padding tuned to the Figma `top:` y-coordinates so
 * the text sits ~53% down the section on desktop, not pinned to the bottom.
 *
 * Overlay uses pure black at Figma opacities (0.36 mobile / 0.40 desktop),
 * not the project `--color-ink` (#101820) — the design clearly references
 * black.
 */
export function WhyChooseHero() {
  return (
    <section className="bg-ink text-surface relative isolate w-full overflow-hidden">
      <BackBreadcrumb href="/" label="Back to Home" />
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 overflow-hidden">
          {/* Mobile crop (Figma 505:7166): left=-34.42% top=-51.91%
              w=221.4% h=151.91%.
              Desktop crop (Figma 344:6117):  left=0     top=-104.96%
              w=129.75% h=220.85%. */}
          <div className="absolute top-[-51.91%] left-[-34.42%] h-[151.91%] w-[221.4%] lg:top-[-104.96%] lg:left-0 lg:h-[220.85%] lg:w-[129.75%]">
            <Image
              src={WHY_CHOOSE_HERO.photo}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 130vw, 222vw"
              className="object-cover object-left-top"
            />
          </div>
        </div>
        <span className="absolute inset-0 bg-black/[0.36] lg:bg-black/[0.4]" />
      </div>

      <Container>
        <div className="flex min-h-[470px] flex-col justify-end pb-[90px] lg:min-h-[705px] lg:pb-[199px]">
          <Reveal>
            <SectionEyebrow variant="red" className="px-[11px] py-[8px]">
              {WHY_CHOOSE_HERO.eyebrow}
            </SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            {/* Figma metadata says 27px from eyebrow→H1 top, BUT our H1's
                82px line-height adds ~18px of invisible leading above the
                glyph (no `text-box-trim` in CSS), so a literal 27px margin
                renders as ~45px visual gap. Compensate with a small mt
                value (~4px) so the visual gap lands near Figma's 23px. */}
            <h1 className="font-body text-surface mt-4 text-[32px] leading-[42px] font-bold capitalize lg:mt-1 lg:text-[64px] lg:leading-[82px] lg:whitespace-nowrap">
              {/* Mobile: 2 lines forced via block spans.
                  Desktop: joined inline with whitespace-nowrap to match Figma. */}
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
