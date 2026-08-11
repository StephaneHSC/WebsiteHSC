"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionHeading } from "@/components/sections/_shared/SectionHeading";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { SERVICES_TEASER } from "@/lib/constants";
import { cn } from "@/lib/utils";

// 7th tile — links to the Value-Added Services section on /services instead
// of a service-detail page, so it can't reuse `ServiceCard` (which always
// links to `/services/${slug}`) or the `Service` type (which requires the
// full detail-page field set). Kept as a plain sentinel in the render list
// so it flows through the same hover/active/scroll-snap mechanics as the
// other 6 cards.
const TEASER_CARD_COUNT_ITEMS = [...SERVICES_TEASER, "value-added" as const];

export function ServicesTeaser() {
  const [rowHovered, setRowHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // Mobile snap-center: tracks which card is currently centered in the
  // viewport. Defaults to index 2 (Ocean FCL) so the third card lands on
  // mount, matching desktop and the Figma frame.
  const [mobileInViewIndex, setMobileInViewIndex] = useState(2);
  // Tablet tap-to-expand (iPad, client request): hover-incapable pointers at
  // md+ don't get the CSS `hover:hover`-gated expand, so a card's Link would
  // otherwise navigate on the very first tap with no chance to preview it
  // expanded first. First tap on a not-yet-expanded card previews it instead
  // of navigating; a second tap on that SAME (already-expanded) card lets the
  // Link through. Phones stay untouched — they render fully expanded from the
  // start (no hover-gated CSS to fight), so a single tap already navigates.
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);
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
            lede={<></>}
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
          {TEASER_CARD_COUNT_ITEMS.map((item, i) => {
            const isMobileCentered = mobileInViewIndex === i;
            return (
              <li
                key={item === "value-added" ? "value-added" : item.slug}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClickCapture={(e) => {
                  if (item === "value-added") return;
                  const isTabletNoHover =
                    typeof window !== "undefined" &&
                    window.matchMedia("(hover: none) and (min-width: 768px)").matches;
                  if (!isTabletNoHover) return;
                  const alreadyExpanded = desktopActive === i || tappedIndex === i;
                  if (!alreadyExpanded) {
                    // First tap: preview instead of navigating. Capture phase
                    // so this runs before the inner <Link>'s own click/nav.
                    e.preventDefault();
                    setTappedIndex(i);
                  }
                }}
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
                  (desktopActive === i || tappedIndex === i) &&
                    "md:!min-w-[420px] lg:!min-w-[600px] xl:!min-w-[720px]",
                )}
              >
                <Reveal delay={0.2 + i * 0.06} className="h-full">
                  {item === "value-added" ? (
                    <ValueAddedTeaserCard number={i + 1} />
                  ) : (
                    <ServiceCard
                      service={item}
                      number={i + 1}
                      active={desktopActive === i || isMobileCentered || tappedIndex === i}
                    />
                  )}
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>

      <Reveal delay={0.5} className="mt-8 flex justify-center lg:hidden">
        <Link
          href="/services#value-added"
          className="font-body border-ink text-ink focus-visible:ring-brand-red inline-flex items-center justify-center rounded-full border border-current bg-white px-6 py-4 text-[14px] font-bold tracking-[0.06em] capitalize transition-colors duration-200 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          View Our Transport Solutions
        </Link>
      </Reveal>
    </Section>
  );
}

/**
 * 7th teaser tile — "Value-Added Services". Mirrors ServiceCard's layout
 * (number badge + bottom title) but links to the accordion section on
 * /services instead of a service-detail page. Placeholder gray fill until
 * a real photo is provided — swap for a `<Image>` the same way ServiceCard
 * does once one lands.
 */
// Drop the photo in at this path (any of .png/.jpg/.webp — just update the
// extension below to match) — same treatment as the other 6 tiles
// (`/public/home/services-teaser/ser-1.png` etc.), just one slot further.
const VALUE_ADDED_TEASER_IMAGE = "/home/services-teaser/ser-7.png";

function ValueAddedTeaserCard({ number }: { number: number }) {
  const numberLabel = number.toString().padStart(2, "0");
  return (
    <Link href="/services#value-added">
      <article className="bg-ink-soft/20 relative h-full w-full overflow-hidden">
        <Image
          src={VALUE_ADDED_TEASER_IMAGE}
          alt=""
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 20vw, 320px"
          className="object-cover"
        />
        <span
          aria-hidden="true"
          className="from-ink/5 via-ink/10 to-ink/80 absolute inset-0 bg-gradient-to-b"
        />
        <span className="font-display text-surface absolute top-4 left-4 text-2xl font-bold md:top-6 md:left-6 md:text-3xl">
          {numberLabel}
        </span>
        <div className="text-surface absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
          <h3 className="font-display text-lg leading-tight font-extrabold tracking-tight uppercase md:text-xl lg:text-2xl">
            Value-Added Services
          </h3>
        </div>
      </article>
    </Link>
  );
}
