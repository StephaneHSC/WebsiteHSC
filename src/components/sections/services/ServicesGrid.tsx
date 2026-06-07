"use client";

import { useState } from "react";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { ServiceCard } from "./ServiceCard";
import { SERVICES } from "@/lib/constants";

/**
 * Services grid — 3×2 white cards on `surface-alt` (#f5f5f5) with mobile
 * tap-to-expand single-open accordion. Desktop relies on CSS hover for the
 * active state and ignores the `activeSlug` toggle except for keyboard users.
 */
export function ServicesGrid() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  return (
    <section className="bg-surface-alt relative w-full overflow-hidden">
      <Container className="max-w-[1600px] py-20 md:py-24 lg:px-[70px] lg:py-[100px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Reveal>
            <SectionEyebrow variant="gray">Our Services</SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-ink text-[24px] leading-[34px] tracking-tight uppercase lg:text-[54px] lg:leading-[66px]">
              <span className="block font-black">We work on solutions</span>
              <span className="block font-bold">and fast response.</span>
            </h2>
          </Reveal>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-[15px] md:grid-cols-2 lg:mt-[100px] lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <li key={service.slug}>
              <Reveal delay={0.1 + (i % 3) * 0.08}>
                <ServiceCard
                  service={service}
                  number={i + 1}
                  isActive={activeSlug === service.slug}
                  onToggle={() =>
                    setActiveSlug((prev) => (prev === service.slug ? null : service.slug))
                  }
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
