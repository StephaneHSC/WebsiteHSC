"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  // Mobile snap-center: tracks which card is currently centered in the
  // viewport. Defaults to index 2 (Ocean FCL) so the third card lands on
  // mount, matching desktop and the Figma frame.
  const [mobileInViewIndex, setMobileInViewIndex] = useState(2);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  // Desktop default-active = 3rd card. On hover, the hovered card takes over.
  const desktopActive = rowHovered ? hoveredIndex : 2;

  // Mobile-only: center the 3rd card on mount, then keep `mobileInViewIndex`
  // in sync with whichever card the user has scrolled to.
  useEffect(() => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Helper: find which card center is closest to the scroller's center
    const getClosestIdx = () => {
      const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;
      let bestIdx = 0;
      let bestDist = Infinity;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const cardCenter = el.offsetLeft + el.offsetWidth / 2;
        const dist = Math.abs(cardCenter - scrollerCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });
      return bestIdx;
    };

    // Wait for layout before scrolling so offsetLeft is accurate.
    // Double-check mobile inside the RAF in case viewport changed between
    // effect scheduling and execution.
    const rafId = requestAnimationFrame(() => {
      if (!window.matchMedia("(max-width: 767px)").matches) return;
      const third = itemRefs.current[2];
      if (third) {
        const target = third.offsetLeft + third.offsetWidth / 2 - scroller.clientWidth / 2;
        // behavior:'instant' overrides CSS scroll-behavior:smooth so card 03
        // jumps into place without animating from card 01 on every page load.
        scroller.scrollTo({ left: Math.max(0, target), behavior: "instant" });
        setMobileInViewIndex(2);
      }
    });

    const onScroll = () => {
      if (!window.matchMedia("(max-width: 767px)").matches) return;
      setMobileInViewIndex(getClosestIdx());
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Desktop: intercept vertical wheel and redirect as horizontal scroll.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    function onWheel(e: WheelEvent) {
      if (!scroller) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = scroller.scrollWidth - scroller.clientWidth;
      const atStart = scroller.scrollLeft <= 0;
      const atEnd = scroller.scrollLeft >= max - 1;
      if ((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0)) return;
      e.preventDefault();
      scroller.scrollBy({ left: e.deltaY, behavior: "auto" });
    }
    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <Section tone="light" spacing="loose" className="overflow-hidden">
      <Container className="max-w-[1440px] lg:px-12">
        <div className="flex items-center justify-between gap-6">
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
          <Reveal delay={0.2} className="hidden shrink-0 lg:block">
            <Link
              href="/services"
              className="font-body border-ink text-ink focus-visible:ring-brand-red inline-flex items-center justify-center rounded-full border border-current bg-white px-6 py-4 text-[14px] font-bold tracking-[0.06em] capitalize transition-colors duration-200 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              View Our Transport Solutions
            </Link>
          </Reveal>
        </div>
      </Container>

      <div
        ref={scrollerRef}
        role="region"
        aria-label="Helicopter transport service offerings"
        tabIndex={0}
        // `snap-x snap-mandatory` MUST live on the scroll container (the
        // element with `overflow`); putting it on the inner <ul> is a no-op.
        className="focus-visible:ring-brand-red mt-12 snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-2 focus-visible:outline-none lg:mt-16 [&::-webkit-scrollbar]:hidden"
      >
        <ul
          // Mobile: symmetric edge padding equal to (viewport − card)/2 so that
          // every card — first and last included — can snap to viewport center.
          // md+: original flush layout with the expanding-active behaviour.
          className="flex gap-1 px-[calc(50vw_-_9rem)] sm:px-[calc(50vw_-_10rem)] md:gap-2.5 md:px-6 lg:px-8"
          onMouseEnter={() => setRowHovered(true)}
          onMouseLeave={() => setRowHovered(false)}
        >
          {SERVICES_TEASER.map((service, i) => {
            const isMobileCentered = mobileInViewIndex === i;
            return (
              <li
                key={service.slug}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                data-active={desktopActive === i ? "true" : undefined}
                data-in-view={isMobileCentered ? "true" : undefined}
                className={cn(
                  "group relative h-[460px] shrink-0 overflow-hidden sm:h-[520px] lg:h-[600px] xl:h-[640px]",
                  // Mobile: fixed card width, snap-center, snap-always so a
                  // single swipe advances exactly one card (no fling-skipping).
                  "w-72 snap-center snap-always sm:w-80",
                  // md+: min-width pattern. Inactive cards stay narrow, the
                  // active card grows wide. Snap-start so the row reads as a
                  // grid rather than a single-card carousel.
                  "md:w-auto md:min-w-[140px] md:snap-start lg:min-w-[180px] xl:min-w-[220px]",
                  "md:transition-[min-width] md:duration-500 md:ease-[cubic-bezier(0.16,1,0.3,1)]",
                  // Mobile: scale neighbours down so the centered card reads
                  // as the largest in frame. Reset on md+ where the desktop
                  // expansion takes over.
                  "scale-[0.88] transition-transform duration-300 ease-out data-[in-view=true]:scale-100 md:!scale-100",
                  desktopActive === i && "md:!min-w-[420px] lg:!min-w-[600px] xl:!min-w-[720px]",
                )}
              >
                <Reveal delay={0.2 + i * 0.06} className="h-full">
                  <ServiceCard
                    service={service}
                    number={i + 1}
                    active={desktopActive === i || isMobileCentered}
                  />
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
