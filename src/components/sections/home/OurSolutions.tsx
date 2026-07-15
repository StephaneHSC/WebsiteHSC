import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionHeading } from "@/components/sections/_shared/SectionHeading";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { buttonVariants } from "@/components/ui/Button";

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
          className="h-auto w-[140%] max-w-none -translate-x-8 [filter:brightness(0.92)_contrast(1.15)] md:w-full md:max-w-6xl md:translate-x-0"
        />
      </div>

      <Container className="relative">
        <SectionHeading
          eyebrow="Our Solutions"
          title={
            <>
              We Deliver Tailored Helicopter{" "}
              <span className="font-semibold md:block">Logistic Solutions</span>
            </>
          }
          lede={
            <>
              <p className="text-ink text-lg font-medium md:text-xl">
                We work on solutions and fast response.
              </p>
              <p className="text-ink-soft mt-2 text-base md:text-xl">
                We bring deep, functional expertise but are known for our flexible and available
                approach to work.
              </p>
            </>
          }
          uppercase
        />
        <Reveal delay={0.3} className="mt-8 flex justify-center">
          <Link
            href="#request-quote"
            className={cn(
              buttonVariants({ variant: "secondary", size: "md" }),
              "border-ink hover:border-ink hover:bg-surface border-[1.5px] font-semibold",
            )}
          >
            Request Quote
          </Link>
        </Reveal>
      </Container>
    </Section>
  );
}
