"use client";

import { useRef } from "react";
import Image from "next/image";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { cn } from "@/lib/utils";
import { SMART_TRACKING_CARDS } from "@/lib/constants";

/**
 * Horizontal scroll-snap card row with prev/next nav buttons.
 *
 * Lives as a client island so the Smart Tracking section above can stay a
 * server component. Mobile users get native swipe; desktop gets buttons that
 * programmatically smooth-scroll one card at a time.
 *
 * Card data is in `SMART_TRACKING_CARDS` so future "Mobile App" pages can
 * reuse it. Cards are full composite assets (title + description + mockup
 * baked into the image); alt text carries accessibility.
 */

export function SmartTrackingCards() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const item = el.querySelector("li");
    if (!item) return;
    const itemWidth = item.getBoundingClientRect().width;
    // Read the actual gap from the <ul> so this stays in sync with the
    // responsive `gap-6 lg:gap-8` utility — no magic numbers.
    const list = item.parentElement;
    const gap = list ? parseFloat(getComputedStyle(list).columnGap || "0") : 0;
    el.scrollBy({ left: dir * (itemWidth + gap), behavior: "smooth" });
  };

  return (
    <Reveal delay={0.4} className="mt-16 lg:mt-24">
      <div
        ref={scrollerRef}
        role="region"
        aria-label="Smart tracking feature cards"
        tabIndex={0}
        className="focus-visible:ring-brand-red overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-2 focus-visible:outline-none [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex snap-x snap-mandatory gap-6 px-4 sm:px-6 lg:gap-8 lg:px-8">
          {SMART_TRACKING_CARDS.map((card) => (
            <li
              key={card.id}
              className="w-[300px] shrink-0 snap-start sm:w-[400px] lg:w-[520px] xl:w-[580px]"
            >
              <Image
                src={card.src}
                alt={card.alt}
                width={1172}
                height={1114}
                quality={90}
                className="h-auto w-full"
                sizes="(min-width: 1280px) 580px, (min-width: 1024px) 520px, (min-width: 640px) 400px, 300px"
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <NavButton direction="prev" onClick={() => scrollByCards(-1)} />
        <NavButton direction="next" onClick={() => scrollByCards(1)} />
      </div>
    </Reveal>
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
