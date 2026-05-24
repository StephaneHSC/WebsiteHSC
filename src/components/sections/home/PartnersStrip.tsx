import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { HELICOPTER_BRANDS } from "@/lib/constants";
import { PartnersMarquee } from "./PartnersMarquee";

/**
 * Home page · "Our partners" / clients strip.
 *
 * Compact band sitting between the team teaser and the testimonials. Eyebrow
 * + heading anchored left, divider line, then a row of helicopter-manufacturer
 * logos. Asset bg in Figma is `#f9f9f9` (surface-alt token).
 */
export function PartnersStrip() {
  return (
    <Section tone="alt" spacing="standard" className="overflow-hidden">
      <Container>
        <div className="flex flex-col items-start gap-4">
          <Reveal>
            <SectionEyebrow variant="outline">Our Clients</SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-ink text-2xl leading-tight tracking-tight uppercase md:text-3xl lg:text-4xl">
              <span className="font-medium">We Ship All</span>{" "}
              <span className="font-extrabold">Helicopter Models</span>
            </h2>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="mt-8">
          <hr className="border-ink/10" />
        </Reveal>

        <Reveal delay={0.3} className="mt-10 md:hidden">
          <PartnersMarquee />
        </Reveal>

        <Reveal delay={0.3}>
          <ul className="mt-10 hidden grid-cols-5 items-center gap-x-3 sm:gap-x-6 md:grid md:gap-x-10">
            {HELICOPTER_BRANDS.map((brand) => (
              <li key={brand.name} className="flex justify-center">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={brand.width}
                  height={brand.height}
                  className="h-6 w-auto object-contain sm:h-8 md:h-12"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
