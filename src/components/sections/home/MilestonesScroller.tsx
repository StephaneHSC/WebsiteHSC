"use client";

import Image from "next/image";
import { useRef } from "react";
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

const CARD_W_PX = { base: 288, lg: 320 };
const GAP_PX = { base: 16, lg: 24 };

type Props = {
  milestones: readonly MilestoneRow[];
};

export function MilestonesScroller({ milestones }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardW = "w-72 lg:w-80";

  function scrollByCards(count: number) {
    const el = scrollRef.current;
    if (!el) return;
    const isLg = window.innerWidth >= 1024;
    const w = isLg ? CARD_W_PX.lg : CARD_W_PX.base;
    const gap = isLg ? GAP_PX.lg : GAP_PX.base;
    el.scrollBy({ left: count * (w + gap), behavior: "smooth" });
  }

  return (
    <>
      {/* Scroll track */}
      <div
        ref={scrollRef}
        className="mt-12 w-full cursor-grab overflow-x-auto [scrollbar-width:none] active:cursor-grabbing lg:mt-16 [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        <div className="inline-flex flex-col px-8 pb-4 md:px-12 lg:px-20">
          {/* Row — timeline line + dots + helicopter */}
          <div className="relative mt-[2rem]">
            {/* Helicopter sits in normal flow above the line */}
            <div
              className="flex w-full"
              style={{
                paddingLeft: `calc(${100 / Math.max(milestones.length, 1)}% + 40px - 48px)`,
              }}
            >
              <Image
                src="/milestones/helicopter.svg"
                alt=""
                width={99}
                height={42}
                aria-hidden="true"
                className="mb-2 h-auto w-24 -scale-x-100 lg:w-28"
              />
            </div>

            {/* The actual line */}
            <span aria-hidden="true" className="bg-ink/15 block h-px w-full" />

            {/* Dots */}
            <div className="absolute inset-x-0 top-[calc(100%-1px)] flex gap-4 lg:gap-6">
              {milestones.map((m, i) => (
                <div key={m._id} className={cn("flex shrink-0 justify-center", cardW)}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block h-3 w-3 -translate-y-1/2 rounded-full",
                      i === 0 ? "bg-brand-red" : "bg-ink-muted",
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 1 — years */}
          <div className="mt-[3rem] flex gap-4 lg:gap-6">
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
          <div className="mt-[4rem] flex items-stretch gap-4 self-stretch lg:gap-6">
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

      {/* Nav buttons */}
      <div className="mt-8 flex justify-center gap-3">
        <NavButton direction="prev" onClick={() => scrollByCards(-1)} />
        <NavButton direction="next" onClick={() => scrollByCards(1)} />
      </div>
    </>
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
};

function NavButton({ direction, onClick }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous cards" : "Next cards"}
      className={cn(
        "border-ink/20 text-ink inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-200",
        "hover:border-ink hover:bg-ink hover:text-surface",
        "focus-visible:ring-brand-red focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
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
