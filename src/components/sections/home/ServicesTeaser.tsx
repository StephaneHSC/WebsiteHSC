"use client";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionHeading } from "@/components/sections/_shared/SectionHeading";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { ScrollSnapRow } from "@/components/sections/_shared/ScrollSnapRow";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { SERVICES_TEASER } from "@/lib/constants";
import { useState } from "react";

export function ServicesTeaser() {
  const [rowHovered, setRowHovered] = useState(false);

  return (
    <Section tone="light" spacing="loose" className="overflow-hidden">
      <Container className="max-w-[1440px] lg:px-12">
        <SectionHeading
          eyebrow="Our Services"
          eyebrowVariant="outline"
          title="Explore Our Flexible Helicopter"
          subtitle="Transport Solutions Worldwide."
          lede="Enables end-to-end visibility on your helicopter shipments for you and your team"
          align="left"
          uppercase
        />
      </Container>

      <ScrollSnapRow
        ariaLabel="Helicopter transport service offerings"
        className="mt-12 gap-3 px-4 sm:px-6 md:snap-none md:gap-1 md:overflow-visible md:px-4 lg:mt-16 lg:px-6"
        onMouseEnter={() => setRowHovered(true)}
        onMouseLeave={() => setRowHovered(false)}
      >
        {SERVICES_TEASER.map((service, i) => (
          <li
            key={service.slug}
            className={[
              "group relative h-[460px] overflow-hidden sm:h-[520px] lg:h-[600px] xl:h-[640px]",
              "w-72 shrink-0 snap-start sm:w-80",
              "md:w-auto md:flex-1 md:shrink md:basis-0",
              "md:transition-[flex-grow] md:duration-500 md:ease-[cubic-bezier(0.16,1,0.3,1)]",
              "md:focus-within:grow-[2.5] md:hover:grow-[2.5]",
              !rowHovered && i === 2 ? "md:grow-[2.5]" : "",
            ].join(" ")}
          >
            <Reveal delay={0.2 + i * 0.06} className="h-full">
              <ServiceCard service={service} number={i + 1} />
            </Reveal>
          </li>
        ))}
      </ScrollSnapRow>
    </Section>
  );
}
