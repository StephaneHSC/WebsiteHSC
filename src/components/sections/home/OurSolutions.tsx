import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionHeading } from "@/components/sections/_shared/SectionHeading";

/**
 * Home page · "Our Solutions" intro band.
 *
 * Light section with a faint dotted world-map graphic centered behind the
 * content. Eyebrow → uppercase headline → lede → outline Request Quote pill,
 * each fading in with a 100ms stagger as the section scrolls into view.
 */
export function OurSolutions() {
  return (
    <Section tone="light" className="overflow-hidden pt-20 md:pt-48 lg:pt-80 lg:pb-70">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <Image
          src="/home/world-map.svg"
          alt=""
          width={1098}
          height={596}
          className="h-auto w-full max-w-6xl [filter:brightness(0.92)_contrast(1.15)]"
        />
      </div>

      <Container className="relative">
        <SectionHeading
          eyebrow="Our Solutions"
          title={
            <>
              We Deliver Tailored Helicopter{" "}
              <span className="font-medium md:block">Logistic Solutions</span>
            </>
          }
          lede="We work on solutions and fast response. We bring deep, functional expertise but are known for our flexible and available approach to work."
          uppercase
        />
      </Container>
    </Section>
  );
}
