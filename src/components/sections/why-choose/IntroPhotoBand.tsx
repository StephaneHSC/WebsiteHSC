import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { WHY_CHOOSE_INTRO_PHOTO } from "@/lib/constants";

/**
 * Wide rounded team-group photo band that sits between the stats band and the
 * first feature block. Visible in the user's reference screenshot — same
 * Leonardo-helicopter team photo as the hero, but contained (not full-bleed)
 * with rounded corners.
 */
export function IntroPhotoBand() {
  return (
    <section className="bg-surface w-full">
      <Container className="py-8 md:py-12 lg:py-12">
        <Reveal>
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={WHY_CHOOSE_INTRO_PHOTO.src}
              alt={WHY_CHOOSE_INTRO_PHOTO.alt}
              fill
              sizes="(min-width: 1024px) 1280px, 100vw"
              className="object-cover object-center"
            />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
