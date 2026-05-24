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
  const cardW = "w-72 lg:w-[360px]";

  function scrollByCards(count: number) {
    const el = scrollRef.current;
    if (!el) return;
    const isLg = window.innerWidth >= 1024;
    const w = isLg ? CARD_W_PX.lg : CARD_W_PX.base;
    const gap = isLg ? GAP_PX.lg : GAP_PX.base;
    el.scrollBy({ left: count * (w + gap), behavior: "smooth" });
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
      // `scroll-pl-*` on the scroller pulls the first card's snap-rest back to
      // scrollLeft=0, so a plain "> 0" check tells us if there's anywhere to go.
      setCanPrev(el.scrollLeft > 1);
      setCanNext(el.scrollLeft < max - 1);
    }
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Scroll track — full bleed on the right, left padding matches the
          QuoteFormShell content start (px-6 lg:px-12) so the section reads as
          a wider band than the centered heading container above it.
          `scroll-pl-*` matches the inner `pl-*` so snap-start lands the first
          card 24/48px from the viewport edge (without it, mandatory snap would
          drag the card flush left and visually erase the padding). */}
      <div
        ref={scrollRef}
        className="mt-4 w-full cursor-grab scroll-pl-6 overflow-x-auto [scrollbar-width:none] active:cursor-grabbing lg:mt-6 lg:scroll-pl-12 [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        <div className="inline-flex flex-col pb-4 pl-6 lg:pl-12">
          {/* Row — timeline line + dots + helicopter. mt is sized to leave
              room for the helicopter (which is absolutely positioned and
              centered on the line, extending ~half its height above it). */}
          <div className="relative mt-8 lg:mt-12">
            {/* The actual line — extends leftward past the inner pl-6/lg:pl-12
                so it bleeds to the viewport edge while dots/cards stay inset
                at the QuoteFormShell column. Rendered first so the helicopter
                can be absolutely positioned and centered on it. */}
            <span
              aria-hidden="true"
              className="bg-ink/15 -ml-6 block h-[2px] w-[calc(100%+1.5rem)] lg:-ml-12 lg:w-[calc(100%+3rem)]"
            />

            {/* Helicopter — absolutely positioned, vertically centered on the
                line. paddingLeft centers it on the midpoint between the first
                two dots (2026 and 2024), so it reads as "flying from past
                toward present".
                  mobile: dots @ 144/448 (w-72 + gap-4), mid = 296, heli w-24
                          → pl = 296-48 = 248px
                  lg+:    dots @ 180/564 (w-[360px] + gap-6), mid = 372,
                          heli w-28 → pl = 372-56 = 316px */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 pl-[248px] lg:pl-[316px]">
              <Image
                src="/milestones/helicopter-red.svg"
                alt=""
                width={76}
                height={33}
                aria-hidden="true"
                className="h-auto w-24 -scale-x-100 md:hidden"
              />
              <Image
                src="/milestones/helicopter.svg"
                alt=""
                width={99}
                height={42}
                aria-hidden="true"
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
                      "block h-3 w-3 -translate-y-1/2 rounded-full ring-[6px]",
                      i === 0 ? "bg-brand-red ring-brand-red/25" : "bg-ink-muted ring-ink-muted/25",
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 1 — years */}
          <div className="mt-6 flex gap-4 lg:gap-6">
            {milestones.map((m, i) => (
              <div key={m._id} className={cn("flex shrink-0 justify-center", cardW)}>
                <Reveal delay={0.2 + i * 0.05}>
                  <span
                    className={cn(
                      "font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-[64px] lg:leading-[50px] lg:tracking-[1.28px]",
                      i === 0 ? "text-brand-red" : "text-ink",
                    )}
                  >
                    {m.year}
                  </span>
                </Reveal>
              </div>
            ))}
          </div>

          {/* Row 3 — cards */}
          <div ref={cardsRowRef} className="mt-12 flex items-stretch gap-4 self-stretch lg:gap-6">
            {milestones.map((m, i) => (
              <div
                key={m._id}
                className={cn("relative flex shrink-0 flex-col", cardW)}
                style={{ scrollSnapAlign: "start" }}
              >
                <Image
                  src={
                    i === 0
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
                    <MilestoneCard milestone={m} active={i === 0} />
                  </Reveal>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav buttons — desktop only, overlaid on the card row; mobile relies on native swipe.
          Inset matches the new scroller padding so the buttons align with the visible
          card band (left = QuoteFormShell start, right = small inset from viewport edge). */}
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
        "bg-surface flex flex-1 flex-col border border-t-[3px] transition-shadow",
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
