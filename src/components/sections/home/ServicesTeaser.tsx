"use client";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionHeading } from "@/components/sections/_shared/SectionHeading";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { SERVICES_TEASER } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ServicesTeaser() {
  const [rowHovered, setRowHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Default-active = 3rd card (Ocean FCL). On hover, the hovered card takes over.
  const activeIndex = rowHovered ? hoveredIndex : 2;

  // Mobile only: on mount, scroll the carousel so the 3rd card is in view —
  // mirrors the desktop default-active behaviour and hints that the row scrolls.
  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const third = scroller.querySelectorAll<HTMLLIElement>("li")[2];
    if (third) scroller.scrollTo({ left: third.offsetLeft - 16, behavior: "smooth" });
  }, []);

  return (
    <Section tone="light" spacing="loose" className="overflow-hidden">
      <Container className="max-w-[1440px] lg:px-12">
        <SectionHeading
          eyebrow="Our Services"
          eyebrowVariant="outline"
          title={
            <>
              Explore Our Flexible Helicopter
              <br className="hidden md:inline" />
            </>
          }
          subtitle="Transport Solutions Worldwide."
          lede={
            <>
              Enables end-to-end visibility on your helicopter <br className="md:hidden" />
              shipments for you and your team
            </>
          }
          align="left"
          uppercase
        />
      </Container>

      <div
        ref={scrollerRef}
        role="region"
        aria-label="Helicopter transport service offerings"
        tabIndex={0}
        className="focus-visible:ring-brand-red mt-12 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-2 focus-visible:outline-none lg:mt-16 [&::-webkit-scrollbar]:hidden"
      >
        <ul
          className="flex snap-x snap-mandatory gap-3 px-4 sm:px-6 md:gap-2.5 md:px-6 lg:px-8"
          onMouseEnter={() => setRowHovered(true)}
          onMouseLeave={() => setRowHovered(false)}
        >
          {SERVICES_TEASER.map((service, i) => (
            <li
              key={service.slug}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              data-active={activeIndex === i ? "true" : undefined}
              className={cn(
                "group relative h-[460px] shrink-0 snap-start overflow-hidden sm:h-[520px] lg:h-[600px] xl:h-[640px]",
                // Mobile: fixed width carousel.
                "w-72 sm:w-80",
                // Desktop+: min-width pattern. Inactive cards stay narrow, the
                // active card grows wide. Card 6 sits past the right edge and
                // is reached by horizontally scrolling/trackpad-swiping the row.
                "md:w-auto md:min-w-[140px] lg:min-w-[180px] xl:min-w-[220px]",
                "md:transition-[min-width] md:duration-500 md:ease-[cubic-bezier(0.16,1,0.3,1)]",
                activeIndex === i && "md:!min-w-[420px] lg:!min-w-[600px] xl:!min-w-[720px]",
              )}
            >
              <Reveal delay={0.2 + i * 0.06} className="h-full">
                <ServiceCard service={service} number={i + 1} active={activeIndex === i} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
