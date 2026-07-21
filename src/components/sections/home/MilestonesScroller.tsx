"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { urlFor } from "@/lib/sanity/image";
import type { Milestone } from "@/types/sanity";
import { cn } from "@/lib/utils";

type PlaceholderMilestone = {
  _id: string;
  year: number;
  headline: string;
  description: string;
  placeholderImage: string;
};

export type MilestoneRow = Milestone | PlaceholderMilestone;

function isPlaceholder(m: MilestoneRow): m is PlaceholderMilestone {
  return "placeholderImage" in m;
}

const CARD_W_PX = { base: 288, lg: 360 };
const GAP_PX = { base: 16, lg: 24 };
const HELI_W_PX = { base: 96, lg: 112 }; // w-24 = 96px, lg:w-28 = 112px
// Fine-tune shift left of the pure center-on-dot position (e.g. lg index 0
// was 360/2 - 112/2 = 124px; this pulls it to 108px to match visually).
const HELI_OFFSET_PX = { base: 16, lg: 16 };

type Props = {
  milestones: readonly MilestoneRow[];
};

export function MilestonesScroller({ milestones }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsRowRef = useRef<HTMLDivElement>(null);

  const [cardsMidPx, setCardsMidPx] = useState<number>(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [heliX, setHeliX] = useState(0); // translateX value for helicopter
  const scrollIdleTimer = useRef<number | undefined>(undefined);

  const cardW = "w-72 lg:w-[360px]";

  /** Content-space X that centers the heli over the dot of `index`. */
  function heliXForIndex(index: number) {
    const isLg = window.innerWidth >= 1024;
    const w = isLg ? CARD_W_PX.lg : CARD_W_PX.base;
    const g = isLg ? GAP_PX.lg : GAP_PX.base;
    const heliW = isLg ? HELI_W_PX.lg : HELI_W_PX.base;
    const offset = isLg ? HELI_OFFSET_PX.lg : HELI_OFFSET_PX.base;
    return index * (w + g) + w / 2 - heliW / 2 - offset;
  }

  // SEQUENCED animation (no simultaneous heli + card motion — running both
  // at once composes two mismatched easings and glitches, since the heli
  // lives inside the scrolled content):
  //   1. cards scroll (heli rides along with the timeline, untouched)
  //   2. scroll settles → activeIndex updates → this effect glides the heli
  //      to the new dot in one clean 500ms transition.
  useEffect(() => {
    const calc = () => setHeliX(heliXForIndex(activeIndex));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [activeIndex]);

  function scrollToIndex(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(milestones.length - 1, index));
    const isLg = window.innerWidth >= 1024;
    const w = isLg ? CARD_W_PX.lg : CARD_W_PX.base;
    const gap = isLg ? GAP_PX.lg : GAP_PX.base;
    // Only scroll — activeIndex (and with it the heli flight + red year)
    // updates when the scroll settles, so the two animations run in
    // sequence instead of fighting.
    const max = el.scrollWidth - el.clientWidth;
    const target = Math.min(clamped * (w + gap), max);
    if (Math.abs(target - el.scrollLeft) < 2) {
      // No scroll will happen (card already aligned, or the end of the list
      // where the last cards can't scroll into alignment) — without a scroll
      // there's no scrollend, so update the index directly and let the heli
      // glide straight to the dot.
      setActiveIndex(clamped);
      return;
    }
    el.scrollTo({ left: target, behavior: "smooth" });
  }

  function scrollByCards(count: number) {
    // Base the target on the CURRENT scroll position, not activeIndex —
    // activeIndex now updates only when scrolling settles, so rapid arrow
    // clicks would otherwise keep re-targeting the same card.
    const el = scrollRef.current;
    if (!el) return;
    const isLg = window.innerWidth >= 1024;
    const w = isLg ? CARD_W_PX.lg : CARD_W_PX.base;
    const gap = isLg ? GAP_PX.lg : GAP_PX.base;
    scrollToIndex(Math.round(el.scrollLeft / (w + gap)) + count);
  }

  useEffect(() => {
    function measure() {
      const row = cardsRowRef.current;
      const wrap = wrapperRef.current;
      if (!row || !wrap) return;
      const r = row.getBoundingClientRect();
      const w = wrap.getBoundingClientRect();
      setCardsMidPx(r.top - w.top + r.height / 2);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (cardsRowRef.current) ro.observe(cardsRowRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function update() {
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      setCanPrev(el.scrollLeft > 1);
      setCanNext(el.scrollLeft < max - 1);
      // Sequenced animation: while scrolling, ONLY the cards move (the heli
      // rides along inside the content, no animation of its own). The
      // active index — and with it the heli flight + red year — updates
      // when the scroll settles (scrollend, with a debounce fallback).
      window.clearTimeout(scrollIdleTimer.current);
      scrollIdleTimer.current = window.setTimeout(onScrollEnd, 150);
    }
    function onScrollEnd() {
      if (!el) return;
      window.clearTimeout(scrollIdleTimer.current);
      const isLg = window.innerWidth >= 1024;
      const w = isLg ? CARD_W_PX.lg : CARD_W_PX.base;
      const g = isLg ? GAP_PX.lg : GAP_PX.base;
      const idx = Math.round(el.scrollLeft / (w + g));
      setActiveIndex(Math.max(0, Math.min(milestones.length - 1, idx)));
    }
    update();
    el.addEventListener("scroll", update, { passive: true });
    el.addEventListener("scrollend", onScrollEnd, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      window.clearTimeout(scrollIdleTimer.current);
      el.removeEventListener("scroll", update);
      el.removeEventListener("scrollend", onScrollEnd);
      ro.disconnect();
    };
  }, [milestones.length]);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        ref={scrollRef}
        className="mt-4 w-full scroll-pl-6 overflow-x-auto overflow-y-hidden [scrollbar-width:none] lg:mt-6 lg:scroll-pl-12 [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        <div className="mt-[15px] inline-flex flex-col pb-4 md:pl-6 lg:pl-12">
          {/* Timeline row — line + helicopter + dots */}
          <div className="relative mt-8 lg:mt-12">
            {/* Line */}
            <span
              aria-hidden="true"
              className="bg-ink/15 -ml-6 block h-[2px] w-[calc(100%+1.5rem)] lg:-ml-12 lg:w-[calc(100%+3rem)]"
            />

            {/* Helicopter — rides with the timeline while the cards scroll,
                then glides to the active dot once the scroll settles
                (sequenced with the card animation, never simultaneous). */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2"
              style={{
                transform: `translateY(-50%) translateX(${heliX}px)`,
                transition: "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <Image
                src="/milestones/helicopter-red.svg"
                alt=""
                width={76}
                height={33}
                className="h-auto w-24 -scale-x-100 md:hidden"
              />
              <Image
                src="/milestones/helicopter.svg"
                alt=""
                width={99}
                height={42}
                className="hidden h-auto w-24 -scale-x-100 md:block lg:w-28"
              />
            </div>

            {/* Dots */}
            <div className="absolute inset-x-0 top-[calc(100%-1px)] flex gap-4 lg:gap-6">
              {milestones.map((m, i) => (
                <div key={m._id} className={cn("flex shrink-0 justify-center", cardW)}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block h-3 w-3 -translate-y-1/2 rounded-full ring-[6px] transition-colors duration-300",
                      i === activeIndex
                        ? "bg-brand-red ring-brand-red/25"
                        : "bg-ink-muted ring-ink-muted/25",
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Years row */}
          <div className="mt-6 flex gap-4 lg:gap-6">
            {milestones.map((m, i) => (
              <div key={m._id} className={cn("flex shrink-0 justify-center", cardW)}>
                <Reveal delay={0.2 + i * 0.05}>
                  <span
                    className={cn(
                      "font-display text-4xl font-bold tracking-tight transition-colors duration-300 md:text-5xl lg:text-[64px] lg:leading-[50px] lg:tracking-[1.28px]",
                      i === activeIndex ? "text-brand-red" : "text-ink",
                    )}
                  >
                    {m.year}
                  </span>
                </Reveal>
              </div>
            ))}
          </div>

          {/* Cards row */}
          <div ref={cardsRowRef} className="mt-12 flex items-stretch gap-4 self-stretch lg:gap-6">
            {milestones.map((m, i) => (
              <div
                key={m._id}
                className={cn("relative flex shrink-0 cursor-pointer flex-col", cardW)}
                style={{ scrollSnapAlign: "start" }}
                onClick={() => scrollToIndex(i)}
              >
                <Image
                  src={
                    i === activeIndex
                      ? "/milestones/connector-active.svg"
                      : "/milestones/connector-inactive.svg"
                  }
                  alt=""
                  aria-hidden="true"
                  width={128}
                  height={27}
                  className="pointer-events-none absolute -top-[27px] left-1/2 z-10 h-[27px] w-32 -translate-x-1/2"
                />
                <div className="flex flex-1 flex-col">
                  <Reveal delay={0.3 + i * 0.08} className="flex flex-1 flex-col">
                    <MilestoneCard milestone={m} active={i === activeIndex} />
                  </Reveal>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NavButton
        direction="prev"
        onClick={() => scrollByCards(-1)}
        visible={canPrev}
        className="absolute left-6 hidden -translate-y-1/2 md:inline-flex lg:left-12"
        style={{ top: cardsMidPx || "50%" }}
      />
      <NavButton
        direction="next"
        onClick={() => scrollByCards(1)}
        visible={canNext}
        className="absolute right-6 hidden -translate-y-1/2 md:inline-flex lg:right-12"
        style={{ top: cardsMidPx || "50%" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type MilestoneCardProps = {
  milestone: MilestoneRow;
  active: boolean;
};

function MilestoneCard({ milestone: m, active }: MilestoneCardProps) {
  const imageSrc = isPlaceholder(m)
    ? m.placeholderImage
    : urlFor(m.image).width(800).height(600).format("webp").quality(82).url();

  return (
    <article
      className={cn(
        "bg-surface flex flex-1 flex-col border border-t-[3px] transition-all duration-300",
        active ? "border-brand-red shadow-[0_0_10px_2px_rgba(0,0,0,0.07)]" : "border-[#f5f5f5]",
      )}
    >
      <div className="flex flex-1 flex-col items-center px-6 pt-8 pb-6 text-center">
        <h3 className="font-display text-ink text-xl leading-[36px] font-bold tracking-[0.48px] uppercase md:text-[24px]">
          {m.headline}
        </h3>
        <p className="font-body text-ink-soft mt-3 text-sm leading-[22px] md:text-[15px]">
          {m.description}
        </p>
      </div>
      <div className="relative mt-auto aspect-[366/270] w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={m.headline}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 25vw, 320px"
          className="object-cover"
        />
      </div>
    </article>
  );
}

type NavButtonProps = {
  direction: "prev" | "next";
  onClick: () => void;
  visible: boolean;
  className?: string;
  style?: React.CSSProperties;
};

function NavButton({ direction, onClick, visible, className, style }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous cards" : "Next cards"}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      style={style}
      className={cn(
        "bg-surface text-ink z-20 inline-flex h-12 w-12 items-center justify-center rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200",
        "hover:bg-ink hover:text-surface hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]",
        "focus-visible:ring-brand-red focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        !visible && "pointer-events-none opacity-0",
        className,
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={direction === "prev" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
